import type { Plugin } from "@opencode/plugin"

export const INTEGRATION_ID = "serper"

/**
 * Resolve the Serper API key, in order:
 *   1. the active `serper` integration connection (from `/connect`, or its
 *      registered `SERPER_API_KEY` env method)
 *   2. the `apiKey` plugin option (explicit override / CI)
 *   3. the ambient `SERPER_API_KEY` environment variable
 */
export async function resolveKey(ctx: Plugin.Context): Promise<string> {
  const connection = await ctx.integration.connection.active(INTEGRATION_ID)
  const credential = connection ? await ctx.integration.connection.resolve(connection) : undefined
  if (credential?.type === "key" && credential.key) return credential.key

  const optionKey = ctx.options.apiKey
  if (typeof optionKey === "string" && optionKey.trim()) return optionKey.trim()

  const envKey = process.env.SERPER_API_KEY?.trim()
  if (envKey) return envKey

  throw new Error(
    "Serper is not configured. Run /connect and choose Serper, set SERPER_API_KEY, or pass options.apiKey to the plugin.",
  )
}
