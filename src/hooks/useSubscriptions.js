import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { listenToSubscriptions } from '../lib/firestore'

/**
 * Real-time Firestore subscription hook.
 *
 * Returns:
 *  - subscriptions: Array of podcast objects (sorted newest-first)
 *  - subscribedIds: Set<string> of uuid values for O(1) membership checks
 *  - loading: true until the first snapshot arrives
 */
export function useSubscriptions() {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setSubscriptions([])
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribe = listenToSubscriptions(user.uid, (data) => {
      setSubscriptions(data)
      setLoading(false)
    })

    return unsubscribe   // clean up listener on unmount / uid change
  }, [user?.uid])

  // Memoised Set for O(1) "is this podcast already saved?" checks
  const subscribedIds = useMemo(
    () => new Set(subscriptions.map((p) => p.uuid)),
    [subscriptions]
  )

  return { subscriptions, subscribedIds, loading }
}
