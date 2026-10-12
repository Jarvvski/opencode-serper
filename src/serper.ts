export const GOOGLE_BASE = "https://google.serper.dev"
export const SCRAPE_ENDPOINT = "https://scrape.serper.dev"

/** A Serper Google result row (web/news/scholar share these fields). */
export interface SerperOrganicResult {
  title?: string
  link?: string
  snippet?: string
  date?: string
}

/** Shape returned by OpenCode's websearch provider interface. */
export interface WebSearchResult {
  url: string
  title?: string
  content?: string
  time: { published?: number }
}

async function postJson<T>(url: string, key: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    signal,
    headers: {
      "X-API-KEY": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    const suffix = detail ? `: ${detail.slice(0, 300)}` : ""
    throw new Error(`Serper request to ${url} failed with HTTP ${response.status}${suffix}`)
  }

  return (await response.json()) as T
}

/** POST to a google.serper.dev endpoint (search, news, scholar, places, images, autocomplete). */
export function googleSearch<T>(endpoint: string, key: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return postJson<T>(`${GOOGLE_BASE}/${endpoint}`, key, body, signal)
}

/** POST to the Serper scraping endpoint. */
export function serperScrape<T>(key: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return postJson<T>(SCRAPE_ENDPOINT, key, body, signal)
}

/** Map Serper organic results into OpenCode's websearch result shape. */
export function toWebSearchResults(results: readonly SerperOrganicResult[]): WebSearchResult[] {
  return results.flatMap((result) => {
    if (!result.link) return []
    const published = result.date ? Date.parse(result.date) : Number.NaN
    return [
      {
        url: result.link,
        ...(result.title ? { title: result.title } : {}),
        ...(result.snippet ? { content: result.snippet } : {}),
        time: Number.isFinite(published) ? { published } : {},
      },
    ]
  })
}
