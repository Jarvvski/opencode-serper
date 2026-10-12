import type { Plugin } from "@opencode/plugin"
import { googleSearch, serperScrape, truncate } from "./serper"
import { resolveKey } from "./key"

export const TOOL_NAMESPACE = "serper"

function json(value: unknown): { content: string } {
  return { content: truncate(JSON.stringify(value, null, 2)) }
}

/**
 * Register Serper's search and scraping endpoints as tools under the `serper`
 * namespace, so agents reach them as `tools.serper.*` in Code Mode.
 */
export async function registerTools(ctx: Plugin.Context): Promise<void> {
  await ctx.tool.transform((editor) => {
    editor.namespace({ name: TOOL_NAMESPACE, description: "Serper search and scraping tools" })

    editor.add({
      name: "search",
      description: "Google web search via Serper. Returns organic results with title, link and snippet.",
      input: {
        type: "object",
        properties: {
          q: { type: "string", description: "Search query" },
          gl: { type: "string", description: "Google country code, e.g. us or gb" },
          hl: { type: "string", description: "Google language code, e.g. en" },
          num: { type: "integer", description: "Number of results (1-100)" },
        },
        required: ["q"],
        additionalProperties: false,
      },
      options: { namespace: TOOL_NAMESPACE, codemode: true },
      async execute(args, context) {
        return json(await googleSearch("search", await resolveKey(ctx), args, context.signal))
      },
    })

    editor.add({
      name: "news",
      description: "Google News search via Serper.",
      input: {
        type: "object",
        properties: {
          q: { type: "string", description: "Search query" },
          gl: { type: "string", description: "Google country code, e.g. us or gb" },
          hl: { type: "string", description: "Google language code, e.g. en" },
          num: { type: "integer", description: "Number of results (1-100)" },
        },
        required: ["q"],
        additionalProperties: false,
      },
      options: { namespace: TOOL_NAMESPACE, codemode: true },
      async execute(args, context) {
        return json(await googleSearch("news", await resolveKey(ctx), args, context.signal))
      },
    })

    editor.add({
      name: "scholar",
      description: "Google Scholar search via Serper.",
      input: {
        type: "object",
        properties: {
          q: { type: "string", description: "Search query" },
          num: { type: "integer", description: "Number of results (1-100)" },
        },
        required: ["q"],
        additionalProperties: false,
      },
      options: { namespace: TOOL_NAMESPACE, codemode: true },
      async execute(args, context) {
        return json(await googleSearch("scholar", await resolveKey(ctx), args, context.signal))
      },
    })

    editor.add({
      name: "places",
      description: "Google Places search via Serper. Returns businesses with address, rating and contact details.",
      input: {
        type: "object",
        properties: {
          q: { type: "string", description: "Search query, e.g. 'coffee shops in Shoreditch'" },
          gl: { type: "string", description: "Google country code, e.g. us or gb" },
          hl: { type: "string", description: "Google language code, e.g. en" },
        },
        required: ["q"],
        additionalProperties: false,
      },
      options: { namespace: TOOL_NAMESPACE, codemode: true },
      async execute(args, context) {
        return json(await googleSearch("places", await resolveKey(ctx), args, context.signal))
      },
    })

    editor.add({
      name: "images",
      description: "Google Images search via Serper.",
      input: {
        type: "object",
        properties: {
          q: { type: "string", description: "Search query" },
          gl: { type: "string", description: "Google country code, e.g. us or gb" },
          hl: { type: "string", description: "Google language code, e.g. en" },
          num: { type: "integer", description: "Number of results (1-100)" },
        },
        required: ["q"],
        additionalProperties: false,
      },
      options: { namespace: TOOL_NAMESPACE, codemode: true },
      async execute(args, context) {
        return json(await googleSearch("images", await resolveKey(ctx), args, context.signal))
      },
    })

    editor.add({
      name: "autocomplete",
      description: "Google autocomplete suggestions via Serper.",
      input: {
        type: "object",
        properties: {
          q: { type: "string", description: "Partial query" },
          gl: { type: "string", description: "Google country code, e.g. us or gb" },
          hl: { type: "string", description: "Google language code, e.g. en" },
        },
        required: ["q"],
        additionalProperties: false,
      },
      options: { namespace: TOOL_NAMESPACE, codemode: true },
      async execute(args, context) {
        return json(await googleSearch("autocomplete", await resolveKey(ctx), args, context.signal))
      },
    })

    editor.add({
      name: "scrape",
      description: "Scrape a single URL and return its extracted content via Serper.",
      input: {
        type: "object",
        properties: {
          url: { type: "string", description: "Absolute URL to scrape" },
        },
        required: ["url"],
        additionalProperties: false,
      },
      options: { namespace: TOOL_NAMESPACE, codemode: true },
      async execute(args, context) {
        return json(await serperScrape(await resolveKey(ctx), args, context.signal))
      },
    })
  })
}
