import { Plugin } from "@opencode/plugin"
import { INTEGRATION_ID } from "./key"
import { registerProvider } from "./provider"
import { registerTools } from "./tools"

export default Plugin.define({
  id: "serper",
  async setup(ctx) {
    // Register the `serper` integration so it can be connected with `/connect`
    // (key entry) or picked up from SERPER_API_KEY (env method).
    await ctx.integration.transform((editor) => {
      editor.update(INTEGRATION_ID, (integration) => {
        integration.name = "Serper"
      })
      editor.method.update({
        integrationID: INTEGRATION_ID,
        method: { type: "key", label: "Serper API key" },
      })
      editor.method.update({
        integrationID: INTEGRATION_ID,
        method: { type: "env", names: ["SERPER_API_KEY"] },
      })
    })

    await registerProvider(ctx)
    await registerTools(ctx)
  },
})
