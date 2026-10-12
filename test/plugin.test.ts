import { afterEach, describe, expect, test } from "bun:test"
import type { Plugin } from "@opencode/plugin"
import plugin from "../src/index"
import { GOOGLE_BASE } from "../src/serper"

const realFetch = globalThis.fetch
const realEnv = process.env.SERPER_API_KEY

afterEach(() => {
  globalThis.fetch = realFetch
  if (realEnv === undefined) delete process.env.SERPER_API_KEY
  else process.env.SERPER_API_KEY = realEnv
})

let calls: Array<{ url: string; init: RequestInit }> = []

function stubFetch(response: Response) {
  calls = []
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init: init ?? {} })
    return response
  }) as typeof fetch
  return calls
}

interface RecordedIntegration {
  id: string
  name: string
}

interface RecordedMethod {
  integrationID: string
  method: { type: string; label?: string; names?: string[] }
}

interface RecordedTool {
  name: string
  description: string
  input: { type: string; required?: string[] }
  options?: { namespace?: string; codemode?: boolean }
  execute: (args: unknown, context: { signal: AbortSignal }) => Promise<unknown>
}

/**
 * A structural stand-in for Plugin.Context that records every registration the
 * plugin makes, so the wiring can be asserted without a live OpenCode runtime.
 */
function recordingContext(options: Record<string, unknown> = {}) {
  const integrations: RecordedIntegration[] = []
  const methods: RecordedMethod[] = []
  const namespaces: Array<{ name: string; description: string }> = []
  const tools: RecordedTool[] = []
  const providers: Array<{
    id: string
    name: string
    execute: (input: { query: string }, context: { signal: AbortSignal }) => Promise<unknown>
  }> = []
  let defaultProvider: string | undefined

  const ctx = {
    options,
    integration: {
      connection: {
        active: async () => undefined,
        resolve: async () => undefined,
      },
      transform: async (callback: (editor: unknown) => void) => {
        callback({
          update: (id: string, fn: (integration: RecordedIntegration) => void) => {
            const integration = { id, name: "" }
            fn(integration)
            integrations.push(integration)
          },
          method: {
            update: (registration: RecordedMethod) => {
              methods.push(registration)
            },
          },
        })
      },
    },
    websearch: {
      transform: async (callback: (editor: unknown) => void) => {
        callback({
          add: (provider: (typeof providers)[number]) => {
            providers.push(provider)
          },
          default: {
            set: (id: string) => {
              defaultProvider = id
            },
          },
        })
      },
    },
    tool: {
      transform: async (callback: (editor: unknown) => void) => {
        callback({
          namespace: (namespace: { name: string; description: string }) => {
            namespaces.push(namespace)
          },
          add: (tool: RecordedTool) => {
            tools.push(tool)
          },
        })
      },
    },
  } as unknown as Plugin.Context

  return {
    ctx,
    integrations,
    methods,
    namespaces,
    tools,
    providers,
    getDefaultProvider: () => defaultProvider,
  }
}

const EXPECTED_TOOLS = ["autocomplete", "images", "news", "places", "scholar", "scrape", "search"]

describe("plugin registration", () => {
  test("declares the serper id", () => {
    expect(plugin.id).toBe("serper")
  })

  test("upserts the serper integration with key and env methods", async () => {
    const rec = recordingContext()
    await plugin.setup(rec.ctx)

    expect(rec.integrations).toEqual([{ id: "serper", name: "Serper" }])
    expect(rec.methods).toContainEqual({
      integrationID: "serper",
      method: { type: "key", label: "Serper API key" },
    })
    expect(rec.methods).toContainEqual({
      integrationID: "serper",
      method: { type: "env", names: ["SERPER_API_KEY"] },
    })
  })

  test("adds the serper websearch provider and selects it as default", async () => {
    const rec = recordingContext()
    await plugin.setup(rec.ctx)

    expect(rec.providers).toHaveLength(1)
    expect(rec.providers[0].id).toBe("serper")
    expect(rec.providers[0].name).toBe("Serper")
    expect(typeof rec.providers[0].execute).toBe("function")
    expect(rec.getDefaultProvider()).toBe("serper")
  })

  test("does not override the default provider when setDefault is false", async () => {
    const rec = recordingContext({ setDefault: false })
    await plugin.setup(rec.ctx)

    expect(rec.providers).toHaveLength(1)
    expect(rec.getDefaultProvider()).toBeUndefined()
  })

  test("registers the serper tool namespace", async () => {
    const rec = recordingContext()
    await plugin.setup(rec.ctx)

    expect(rec.namespaces).toEqual([{ name: "serper", description: "Serper search and scraping tools" }])
  })

  test("registers exactly the expected tools, namespaced with JSON-schema input", async () => {
    const rec = recordingContext()
    await plugin.setup(rec.ctx)

    expect(rec.tools.map((tool) => tool.name).sort()).toEqual(EXPECTED_TOOLS)
    for (const tool of rec.tools) {
      expect(tool.options).toMatchObject({ namespace: "serper", codemode: true })
      expect(tool.input.type).toBe("object")
      expect(tool.input.required?.length).toBeGreaterThan(0)
      expect(typeof tool.execute).toBe("function")
    }
  })

  test("the websearch provider resolves a key and maps Serper results", async () => {
    process.env.SERPER_API_KEY = "test-key"
    const calls = stubFetch(
      Response.json({ organic: [{ title: "OpenCode", link: "https://opencode.ai/", snippet: "Agent" }] }),
    )

    const rec = recordingContext()
    await plugin.setup(rec.ctx)

    const results = await rec.providers[0].execute(
      { query: "opencode" },
      { signal: new AbortController().signal },
    )

    expect(calls[0].url).toBe(`${GOOGLE_BASE}/search`)
    expect(calls[0].init.headers).toMatchObject({ "X-API-KEY": "test-key" })
    expect(results).toEqual([
      { url: "https://opencode.ai/", title: "OpenCode", content: "Agent", time: {} },
    ])
  })
})
