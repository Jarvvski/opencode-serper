import type { Plugin } from "@opencode/plugin"
import { googleSearch, toWebSearchResults, type SerperOrganicResult } from "./serper"
import { resolveKey } from "./key"

export const PROVIDER_ID = "serper"

/** Register Serper as an OpenCode websearch provider and select it as the default. */
export async function registerProvider(ctx: Plugin.Context): Promise<void> {
  await ctx.websearch.transform((editor) => {
    editor.add({
      id: PROVIDER_ID,
      name: "Serper",
      async execute({ query }, { signal }) {
        const key = await resolveKey(ctx)
        const data = await googleSearch<{ organic?: SerperOrganicResult[] }>(
          "search",
          key,
          { q: query, num: 8 },
          signal,
        )
        return toWebSearchResults(data.organic ?? [])
      },
    })
    editor.default.set(PROVIDER_ID)
  })
}
