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
    // Select Serper as the default provider unless the user opted out with
    // `options: { setDefault: false }`, so installing the plugin does not
    // silently override a websearch provider they chose on purpose.
    if (ctx.options.setDefault !== false) editor.default.set(PROVIDER_ID)
  })
}
