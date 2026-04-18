import { useState, useEffect, useRef } from 'react'
import { searchPodcasts } from '../lib/taddy'

const DEBOUNCE_MS = 400  // wait for user to stop typing before firing

/**
 * Debounced podcast search hook.
 *
 * @param {string} query - Live search string from the input
 * @returns {{ results, status, error }}
 *   status: 'idle' | 'loading' | 'success' | 'error'
 */
export function usePodcastSearch(query) {
  const [results, setResults] = useState([])
  const [status,  setStatus]  = useState('idle')   // idle | loading | success | error
  const [error,   setError]   = useState(null)

  // AbortController ref — cancels in-flight requests when query changes
  const abortRef = useRef(null)

  useEffect(() => {
    const trimmed = query.trim()

    if (!trimmed) {
      setResults([])
      setStatus('idle')
      setError(null)
      return
    }

    // Debounce timer
    const timer = setTimeout(async () => {
      // Cancel any in-flight request
      abortRef.current?.abort()

      setStatus('loading')
      setError(null)

      try {
        const data = await searchPodcasts(trimmed)
        setResults(data)
        setStatus('success')
      } catch (err) {
        if (err.name === 'AbortError') return  // intentional cancel — ignore
        console.error('[Taddy] Search failed:', err)
        setError(err.message)
        setStatus('error')
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query])

  return { results, status, error }
}
