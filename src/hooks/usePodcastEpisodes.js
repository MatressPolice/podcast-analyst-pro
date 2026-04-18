import { useState, useEffect } from 'react'
import { getPodcastSeries } from '../lib/taddy'

/**
 * Fetches a podcast series + its recent episodes from Taddy.
 * Cancels any in-flight request if the uuid changes.
 *
 * @param {string|null} podcastUuid
 * @returns {{ series, loading, error }}
 *   series: { uuid, name, description, imageUrl, episodes[] } | null
 */
export function usePodcastEpisodes(podcastUuid) {
  const [series,  setSeries]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!podcastUuid) {
      setSeries(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setSeries(null)

    async function fetchSeries() {
      try {
        const result = await getPodcastSeries(podcastUuid)
        if (!cancelled) setSeries(result)
      } catch (err) {
        if (!cancelled) {
          console.error('[Taddy] Episode fetch failed:', err)
          setError(err.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSeries()
    return () => { cancelled = true }
  }, [podcastUuid])

  return { series, loading, error }
}
