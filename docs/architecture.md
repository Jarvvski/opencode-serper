# Architecture

`opencode-serper` is a single OpenCode V2 plugin. On load it registers three
things through the plugin context, then gets out of the way.

```
src/index.ts      Plugin.define({ id: "serper", setup })
  ├─ ctx.integration  → registers the "serper" integration (key + env methods)
  ├─ src/provider.ts  → registers the "serper" websearch provider
  └─ src/tools.ts     → registers the serper.* tools
src/key.ts        key resolution (integration → option → env)
src/serper.ts     HTTP transport + pure result mappers (no plugin coupling)
```

## Registration

`setup(ctx)` runs three transforms:

1. **Integration** (`ctx.integration.transform`) - upserts a `serper` integration
   with a `key` method (for `/connect`) and an `env` method named
   `SERPER_API_KEY`. `IntegrationEditor` has no `add`; `update` upserts.
2. **Websearch provider** (`ctx.websearch.transform`) - adds a provider with id
   `serper` and selects it as the default. Its `execute({ query }, { signal })`
   calls `google.serper.dev/search` and maps the organic results into OpenCode's
   result shape.
3. **Tools** (`ctx.tool.transform`) - namespaces `serper` and adds one tool per
   endpoint the websearch provider interface does not cover.

Each transform returns a registration the plugin does not need to dispose: the
plugin is loaded once per server and lives for its lifetime.

## Why a plugin

OpenCode's built-in `websearch` tool ships five providers (Exa, Firecrawl,
Parallel, Tavily, TinyFish); Serper is not one. A plugin can register a websearch
provider, so the built-in tool - and every agent that already uses it - can
search via Serper without per-agent wiring. See
[adr/0001-ship-as-an-opencode-plugin.md](adr/0001-ship-as-an-opencode-plugin.md).

## Result mapping

OpenCode's websearch result is:

```ts
interface WebSearchResult {
  url: string            // required
  title?: string
  content?: string
  time: { published?: number }  // required, may be empty
}
```

`src/serper.ts` maps a Serper organic row (`{ title, link, snippet, date }`)
into it: `link` → `url`, `snippet` → `content`, and a parseable `date` →
`time.published`. Rows without a `link` are dropped. The mapper is pure, so it is
covered by unit tests without touching the network.

The `serper.*` tools do not use this shape - they return the raw Serper JSON as a
text result, since each endpoint (news, places, images, ...) has its own fields.
That JSON is capped at `MAX_TOOL_CONTENT` (20,000 characters) by `truncate`, so a
large scrape cannot blow the model's context window; the cut is marked with the
original size.

Because the provider only maps `snippet` into `content`, the built-in `websearch`
tool answers from search snippets rather than full page content. That is the
trade-off for routing the built-in tool through Serper; the `scrape` tool is the
escape hatch for full page text.

## Key resolution

`src/key.ts` resolves the key in order: the active `serper` integration
credential, then the `apiKey` plugin option, then `SERPER_API_KEY`. It is the
only module that reads the key, so a key never reaches logs or error messages.
See [adr/0002-connect-credential-over-config.md](adr/0002-connect-credential-over-config.md).

## Error handling

`src/serper.ts` throws on a non-2xx response with the status and a truncated
body. A missing key throws an actionable error naming all three sources. Both
surface through the tool result; nothing is swallowed.
