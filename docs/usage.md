# Usage

How to install, connect, and use `opencode-serper`. For a quick start see the
[README](../README.md); this page is the fuller reference.

## Install

```sh
opencode plugin add github:Jarvvski/opencode-serper
```

This adds the Git spec to the `plugins` array in your global `opencode.jsonc`.
Restart OpenCode so the plugin loads.

The package is not published to npm yet, so install from the Git spec above
rather than the package name. Once it is on npm, `opencode plugin add
@jarvvski/opencode-serper` will work the same way.

## Connect the API key

Pick one:

1. **`/connect` (recommended).** Run `/connect` in the TUI, choose **Serper**,
   and paste your key. It is stored in OpenCode's credential store, outside
   `opencode.jsonc`.
2. **Environment variable.** Export `SERPER_API_KEY` before starting OpenCode.
   The key is read by the background service, so if one is already running,
   restart it (`opencode service restart`) after changing the variable.
3. **Plugin option.** Pass the key explicitly in `opencode.jsonc`:

   ```jsonc
   {
     "plugins": [
       { "package": "github:Jarvvski/opencode-serper", "options": { "apiKey": "..." } },
     ],
   }
   ```

The plugin resolves the key in this order: `/connect` credential, then
`options.apiKey`, then `SERPER_API_KEY`. See
[configuration.md](configuration.md#api-key-resolution) for details.

## Search

Installing the plugin registers Serper as a `websearch` provider and selects it
as the default, so the built-in `websearch` tool - and any agent that uses it -
searches through Serper with no further setup.

To be explicit, or to switch back to another provider:

```jsonc
{
  "websearch": { "provider": "serper" },
}
```

To keep another provider as the default and use only the `serper.*` tools, pass
`options.setDefault: false` when configuring the plugin. See
[configuration.md](configuration.md#web-search-provider).

Then ask for current information:

```text
Find the latest Jujutsu release and summarize what changed.
```

## Tools

The `websearch` provider only covers web search, so the plugin also exposes
Serper's other endpoints as tools. Agents reach them in Code Mode as
`tools.serper.<name>`; each returns the Serper response as pretty-printed JSON.

| Tool           | Endpoint                 | Input                        |
| -------------- | ------------------------ | ---------------------------- |
| `search`       | `google.serper.dev/search` | `q`, `gl?`, `hl?`, `num?`  |
| `news`         | `google.serper.dev/news`   | `q`, `gl?`, `hl?`, `num?`  |
| `scholar`      | `google.serper.dev/scholar`| `q`, `num?`                |
| `places`       | `google.serper.dev/places` | `q`, `gl?`, `hl?`          |
| `images`       | `google.serper.dev/images` | `q`, `gl?`, `hl?`, `num?`  |
| `autocomplete` | `google.serper.dev/autocomplete` | `q`, `gl?`, `hl?`   |
| `scrape`       | `scrape.serper.dev`        | `url`                      |

- `q` - the search query.
- `gl` - Google country code, e.g. `us`, `gb`.
- `hl` - Google language code, e.g. `en`.
- `num` - number of results, `1`-`100`.
- `url` - absolute URL to scrape.

### Examples

Ask an agent in plain language and it will pick the tool:

```text
Search the news for "open source AI coding agent" from the last week.
```

```text
Scrape https://opencode.ai/v2/docs/websearch and summarize the providers it lists.
```

Or call the tools directly in Code Mode:

```js
const results = await tools.serper.search({ q: "jujutsu vcs", gl: "us", hl: "en", num: 5 })
const article = await tools.serper.scrape({ url: "https://jj-vcs.dev/latest/changelog/" })
```

## Troubleshooting

**Search fails with "Serper is not configured".** The plugin could not resolve a
key. Run `/connect` and choose Serper, or set `SERPER_API_KEY`, or pass
`options.apiKey`. See [configuration.md](configuration.md#api-key-resolution).

**The plugin does not load.** Plugin changes need a server restart; `opencode
reload` does not reconcile plugins. After adding a local plugin, restart the
service (`opencode service restart`).

**HTTP 401 / 403 from Serper.** The stored key is wrong or revoked. Reconnect
with `/connect`, or replace `SERPER_API_KEY`.

**HTTP 429.** Serper rate limit. Wait and retry, or check your Serper plan.
