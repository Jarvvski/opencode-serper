import { afterEach, describe, expect, test } from "bun:test"
import {
  GOOGLE_BASE,
  MAX_TOOL_CONTENT,
  SCRAPE_ENDPOINT,
  googleSearch,
  serperScrape,
  toWebSearchResults,
  truncate,
} from "../src/serper"

const realFetch = globalThis.fetch
let calls: Array<{ url: string; init: RequestInit }> = []

function stubFetch(response: Response) {
  calls = []
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init: init ?? {} })
    return response
  }) as typeof fetch
  return calls
}

afterEach(() => {
  globalThis.fetch = realFetch
})

describe("toWebSearchResults", () => {
  test("maps organic results into websearch results", () => {
    const results = toWebSearchResults([
      {
        title: "OpenCode",
        link: "https://opencode.ai/",
        snippet: "An open source AI coding agent",
        date: "Jul 28, 2026",
      },
    ])

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      url: "https://opencode.ai/",
      title: "OpenCode",
      content: "An open source AI coding agent",
      time: { published: Date.parse("Jul 28, 2026") },
    })
  })

  test("skips results without a link", () => {
    expect(toWebSearchResults([{ title: "no link here" }])).toEqual([])
  })

  test("omits optional fields and published time when absent", () => {
    const [result] = toWebSearchResults([{ link: "https://example.com" }])

    expect(result).toEqual({ url: "https://example.com", time: {} })
    expect(result).not.toHaveProperty("title")
    expect(result).not.toHaveProperty("content")
  })

  test("drops an unparseable date instead of emitting NaN", () => {
    const [result] = toWebSearchResults([{ link: "https://example.com", date: "not a date" }])
    expect(result.time).toEqual({})
  })
})

describe("truncate", () => {
  test("returns short text unchanged", () => {
    expect(truncate("hello", 10)).toBe("hello")
  })

  test("caps long text and names the original size", () => {
    const long = "x".repeat(50)
    const out = truncate(long, 10)

    expect(out.startsWith("x".repeat(10))).toBe(true)
    expect(out).toContain("truncated: showing 10 of 50 characters")
  })

  test("uses MAX_TOOL_CONTENT as the default limit", () => {
    const long = "x".repeat(MAX_TOOL_CONTENT + 1)
    expect(truncate(long)).toContain(`of ${MAX_TOOL_CONTENT + 1} characters`)
  })
})

describe("transport", () => {
  test("googleSearch posts to the google endpoint with the API key and JSON body", async () => {
    const calls = stubFetch(Response.json({ organic: [] }))

    await googleSearch("search", "secret", { q: "hi", num: 3 })

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe(`${GOOGLE_BASE}/search`)
    expect(calls[0].init.method).toBe("POST")
    expect(calls[0].init.body).toBe(JSON.stringify({ q: "hi", num: 3 }))
    expect(calls[0].init.headers).toMatchObject({
      "X-API-KEY": "secret",
      "Content-Type": "application/json",
    })
  })

  test("serperScrape posts to the scrape endpoint and returns parsed JSON", async () => {
    const calls = stubFetch(Response.json({ text: "hello" }))

    const result = await serperScrape<{ text: string }>("secret", { url: "https://example.com" })

    expect(calls[0].url).toBe(SCRAPE_ENDPOINT)
    expect(result).toEqual({ text: "hello" })
  })

  test("forwards the abort signal to fetch", async () => {
    const calls = stubFetch(Response.json({ organic: [] }))
    const controller = new AbortController()

    await googleSearch("search", "secret", { q: "hi" }, controller.signal)

    expect(calls[0].init.signal).toBe(controller.signal)
  })

  test("throws with the status and body on a non-2xx response", async () => {
    stubFetch(new Response("bad key", { status: 401 }))

    await expect(googleSearch("search", "secret", { q: "hi" })).rejects.toThrow(
      /failed with HTTP 401: bad key/,
    )
  })
})
