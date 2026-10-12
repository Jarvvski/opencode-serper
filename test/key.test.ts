import { afterEach, describe, expect, test } from "bun:test"
import type { Plugin } from "@opencode/plugin"
import { resolveKey } from "../src/key"

const realEnv = process.env.SERPER_API_KEY

afterEach(() => {
  if (realEnv === undefined) delete process.env.SERPER_API_KEY
  else process.env.SERPER_API_KEY = realEnv
})

interface FakeContextOptions {
  credential?: { type: "key"; key: string }
  connection?: boolean
  options?: Record<string, unknown>
}

function fakeContext(opts: FakeContextOptions = {}): Plugin.Context {
  const { credential, connection = credential !== undefined, options = {} } = opts
  return {
    options,
    integration: {
      connection: {
        active: async () =>
          connection ? { type: "credential", id: "cred_x", label: "Serper", method: "key" } : undefined,
        resolve: async () => credential,
      },
    },
  } as unknown as Plugin.Context
}

describe("resolveKey", () => {
  test("prefers the connected credential over everything else", async () => {
    process.env.SERPER_API_KEY = "from-env"
    const key = await resolveKey(
      fakeContext({ credential: { type: "key", key: "from-cred" }, options: { apiKey: "from-option" } }),
    )
    expect(key).toBe("from-cred")
  })

  test("falls back to the apiKey option when there is no connection", async () => {
    process.env.SERPER_API_KEY = "from-env"
    const key = await resolveKey(fakeContext({ options: { apiKey: "from-option" } }))
    expect(key).toBe("from-option")
  })

  test("falls back to SERPER_API_KEY when nothing else is set", async () => {
    process.env.SERPER_API_KEY = "from-env"
    expect(await resolveKey(fakeContext())).toBe("from-env")
  })

  test("trims the resolved key", async () => {
    const key = await resolveKey(fakeContext({ options: { apiKey: "  spaced  " } }))
    expect(key).toBe("spaced")
  })

  test("ignores a blank option and falls through to the environment", async () => {
    process.env.SERPER_API_KEY = "from-env"
    const key = await resolveKey(fakeContext({ options: { apiKey: "   " } }))
    expect(key).toBe("from-env")
  })

  test("falls through to the environment when the credential store throws", async () => {
    process.env.SERPER_API_KEY = "from-env"
    const ctx = {
      options: {},
      integration: {
        connection: {
          active: async () => {
            throw new Error("credential store unavailable")
          },
          resolve: async () => undefined,
        },
      },
    } as unknown as Plugin.Context

    expect(await resolveKey(ctx)).toBe("from-env")
  })

  test("throws an actionable error when nothing is configured", async () => {
    delete process.env.SERPER_API_KEY
    await expect(resolveKey(fakeContext())).rejects.toThrow(/Serper is not configured/)
  })
})
