// Taddy GraphQL client — Task 2.3 / 3.1
// Docs: https://taddy.org/developers/podcast-api
const TADDY_ENDPOINT = 'https://api.taddy.org'

// ── Shared fetch helper ───────────────────────────────────────────────────────
async function taddyRequest(query, variables = {}) {
  const response = await fetch(TADDY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-USER-ID':    import.meta.env.VITE_TADDY_USER_ID,
      'X-API-KEY':    import.meta.env.VITE_TADDY_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Taddy responded with ${response.status}: ${response.statusText}`)
  }

  const json = await response.json()

  if (json.errors?.length) {
    throw new Error(json.errors[0].message ?? 'GraphQL error from Taddy')
  }

  return json.data
}

// ── Search ────────────────────────────────────────────────────────────────────
const SEARCH_QUERY = `
  query SearchPodcasts($term: String!, $page: Int, $limitPerPage: Int) {
    searchForTerm(
      term: $term
      page: $page
      limitPerPage: $limitPerPage
      filterForTypes: PODCASTSERIES
    ) {
      searchId
      podcastSeries {
        uuid
        name
        description
        imageUrl
        itunesId
      }
    }
  }
`

/**
 * Search Taddy for podcast series matching the given term.
 * @param {string} term   - Search string
 * @param {number} limit  - Max results (default 20)
 * @returns {Promise<Array>} Array of podcast series objects
 */
export async function searchPodcasts(term, limit = 20) {
  const data = await taddyRequest(SEARCH_QUERY, { term, page: 1, limitPerPage: limit })
  return data?.searchForTerm?.podcastSeries ?? []
}

// ── Episode Browser ───────────────────────────────────────────────────────────
const GET_PODCAST_SERIES_QUERY = `
  query GetPodcastSeries($uuid: ID!, $limitPerPage: Int) {
    getPodcastSeries(uuid: $uuid) {
      uuid
      name
      description
      imageUrl
      episodes(page: 1, limitPerPage: $limitPerPage) {
        uuid
        name
        description
        datePublished
        audioUrl
      }
    }
  }
`

/**
 * Fetch a podcast series with its most recent episodes.
 * Episode `name` field maps to the episode title in the Taddy schema.
 *
 * @param {string} podcastUuid
 * @param {number} limit - Max episodes to return (default 25, Taddy hard cap)
 * @returns {Promise<object|null>} Series object with nested episodes array
 */
export async function getPodcastSeries(podcastUuid, limit = 25) {
  const data = await taddyRequest(GET_PODCAST_SERIES_QUERY, {
    uuid: podcastUuid,
    limitPerPage: limit,
  })
  return data?.getPodcastSeries ?? null
}
