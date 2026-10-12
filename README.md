# @jarvvski/opencode-serper

A [Serper](https://serper.dev) plugin for [OpenCode](https://opencode.ai): it registers
Serper as a web search provider and adds a set of `serper.*` search and scraping tools.

## Features

- **Web search provider** — Serper becomes a selectable `websearch` provider, so the
  built-in `websearch` tool (and every agent that uses it) searches via Serper.
- **Search & scrape tools** — Google web/news/scholar/places/images search, autocomplete,
  and URL scraping, exposed under the `serper` tool namespace.
- **`/connect` integration** — connect Serper once from the TUI; the key is stored in
  OpenCode's credential store, not in your config.

## Install

```sh
opencode plugin add @jarvvski/opencode-serper
```

Or reference a checkout directly in `opencode.jsonc`:

```jsonc
{
  "plugins": ["/absolute/path/to/opencode-serper"],
}
```

Restart OpenCode after adding a local plugin so it is loaded.

## Configure the API key

Pick one:

1. **`/connect` (recommended)** — run `/connect` in the TUI, choose **Serper**, and paste
   your API key. It is stored in OpenCode's credential store.
2. **Environment variable** — set `SERPER_API_KEY` before starting OpenCode.
3. **Plugin option** — pass it explicitly:

   ```jsonc
   {
     "plugins": [
       { "package": "@jarvvski/opencode-serper", "options": { "apiKey": "..." } },
     ],
   }
   ```

Resolution order is: `/connect` credential → `options.apiKey` → `SERPER_API_KEY`.

## Use as the web search provider

The plugin selects itself as the default provider on load. To be explicit, or to switch
back, set it in `opencode.jsonc`:

```jsonc
{
  "websearch": { "provider": "serper" },
}
```

## Tools

Available to agents in Code Mode as `tools.serper.<name>`:

| Tool           | Description                                          |
| -------------- | ---------------------------------------------------- |
| `search`       | Google web search (`q`, `gl`, `hl`, `num`)           |
| `news`         | Google News search                                   |
| `scholar`      | Google Scholar search                                |
| `places`       | Google Places search (address, rating, contact)      |
| `images`       | Google Images search                                 |
| `autocomplete` | Google autocomplete suggestions                      |
| `scrape`       | Scrape a URL and return its extracted content        |

Each returns the Serper response as pretty-printed JSON.

## Development

```sh
bun install
bun run typecheck
bun test
```

## License

[MIT](./LICENSE)
