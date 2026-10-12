import { describe, expect, test } from "bun:test"
import { toWebSearchResults } from "../src/serper"

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
