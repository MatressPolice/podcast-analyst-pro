// Firestore helpers — Task 2.4 (subscriptions) + Task 4.1 (analyses)
// Subscription path: users/{uid}/subscriptions/{podcastUuid}
// Analysis path:     users/{uid}/analyses/{episodeUuid}
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Returns a reference to the user's subscriptions sub-collection.
 * @param {string} uid - Firebase Auth UID
 */
function subscriptionsRef(uid) {
  return collection(db, 'users', uid, 'subscriptions')
}

/**
 * Add a podcast to the user's Firestore subscription library.
 * Uses the podcast uuid as the document ID so re-adds are idempotent.
 *
 * @param {string} uid
 * @param {{ uuid, name, description, imageUrl, itunesId }} podcast
 */
export async function addSubscription(uid, podcast) {
  const ref = doc(subscriptionsRef(uid), podcast.uuid)
  await setDoc(ref, {
    uuid:        podcast.uuid,
    name:        podcast.name,
    description: podcast.description ?? '',
    imageUrl:    podcast.imageUrl    ?? '',
    itunesId:    podcast.itunesId   ?? null,
    addedAt:     serverTimestamp(),
  })
}

/**
 * Remove a podcast from the user's subscription library.
 *
 * @param {string} uid
 * @param {string} podcastUuid
 */
export async function removeSubscription(uid, podcastUuid) {
  const ref = doc(subscriptionsRef(uid), podcastUuid)
  await deleteDoc(ref)
}

/**
 * Subscribe to real-time updates on the user's subscription list.
 * Returns an unsubscribe function — call it on component unmount.
 *
 * @param {string} uid
 * @param {(podcasts: Array) => void} callback
 * @returns {() => void} unsubscribe
 */
export function listenToSubscriptions(uid, callback) {
  const ref = subscriptionsRef(uid)
  return onSnapshot(
    ref,
    (snapshot) => {
      const podcasts = snapshot.docs.map((d) => d.data())
      // Sort newest-first by addedAt (Firestore Timestamp)
      podcasts.sort((a, b) => {
        const ta = a.addedAt?.seconds ?? 0
        const tb = b.addedAt?.seconds ?? 0
        return tb - ta
      })
      callback(podcasts)
    },
    (err) => {
      console.error('[Firestore] Subscription listener error:', err)
      callback([])
    }
  )
}

// ── Analyses (Task 4.1) ───────────────────────────────────────────────────────
// Path: users/{uid}/analyses/{episodeUuid}
// Status lifecycle: queued → processing → completed | error

function analysisRef(uid, episodeUuid) {
  return doc(db, 'users', uid, 'analyses', episodeUuid)
}

/**
 * Create or overwrite an analysis document for an episode.
 * Use setDoc so re-triggering analysis resets the document cleanly.
 */
export async function createAnalysis(uid, episodeUuid, fields) {
  await setDoc(analysisRef(uid, episodeUuid), {
    episodeUuid,
    ...fields,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Merge-update specific fields on an existing analysis document.
 */
export async function updateAnalysis(uid, episodeUuid, fields) {
  await updateDoc(analysisRef(uid, episodeUuid), {
    ...fields,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Real-time listener for a single analysis document.
 * Returns an unsubscribe function.
 *
 * @param {string}   uid
 * @param {string}   episodeUuid
 * @param {Function} callback — called with the doc data object, or null if missing
 * @returns {() => void} unsubscribe
 */
export function listenToAnalysis(uid, episodeUuid, callback) {
  return onSnapshot(
    analysisRef(uid, episodeUuid),
    (snap) => callback(snap.exists() ? snap.data() : null),
    (err) => {
      console.error('[Firestore] Analysis listener error:', err)
      callback(null)
    }
  )
}
