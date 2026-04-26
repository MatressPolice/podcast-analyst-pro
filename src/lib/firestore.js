// Firestore helpers — Task 2.4 (subscriptions) + Task 4.1 (analyses) + Task 5.2 (prompts) + Task 5.3 (logs)
// Subscription path: artifacts/{appId}/users/{uid}/subscriptions/{podcastUuid}
// Analysis path:     artifacts/{appId}/users/{uid}/analyses/{episodeUuid}
// Prompt path:       artifacts/{appId}/users/{uid}/prompts/{promptId}
// Log path:          artifacts/{appId}/users/{uid}/logs/{logId}
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  where,
  limit,
} from 'firebase/firestore'
import { db } from './firebase'

// We use the project ID to maintain clean URLs for the unified "artifacts" root
const APP_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'podcast-analyst-pro'

// ── Editorial Sage — the built-in fallback prompt ─────────────────────────────
export const DEFAULT_PROMPT = {
  name: 'Editorial Sage',
  text: `You are Sage, a critical analyst. Evaluate this transcript for weak logic, lazy assumptions, or unearned conclusions. Provide two distinct sections: "Key Takeaways" and "Critical Gaps". Keep the tone sharp, professional, and intellectually rigorous.`,
  isActive: true,
}

/**
 * Returns a reference to the user's subscriptions sub-collection.
 * @param {string} uid - Firebase Auth UID
 */
function subscriptionsRef(uid) {
  return collection(db, 'artifacts', APP_ID, 'users', uid, 'subscriptions')
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
    uuid: podcast.uuid,
    name: podcast.name,
    description: podcast.description ?? '',
    imageUrl: podcast.imageUrl ?? '',
    itunesId: podcast.itunesId ?? null,
    addedAt: serverTimestamp(),
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
// Path: artifacts/{appId}/users/{uid}/analyses/{episodeUuid}
// Status lifecycle: queued → processing → completed | error

function analysisRef(uid, episodeUuid) {
  return doc(db, 'artifacts', APP_ID, 'users', uid, 'analyses', episodeUuid)
}

function analysesCollectionRef(uid) {
  return collection(db, 'artifacts', APP_ID, 'users', uid, 'analyses')
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
 * Permanently delete an analysis document.
 *
 * @param {string} uid
 * @param {string} episodeUuid
 */
export async function deleteAnalysis(uid, episodeUuid) {
  await deleteDoc(analysisRef(uid, episodeUuid))
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

/**
 * Real-time listener for ALL analysis documents for a specific user.
 * Ordered by creation date (newest first). Used mainly in the Archive page.
 * Returns an unsubscribe function.
 *
 * @param {string}   uid
 * @param {Function} callback — called with array of full analysis document objects
 * @returns {() => void} unsubscribe
 */
export function listenToAllAnalyses(uid, callback) {
  return onSnapshot(
    analysesCollectionRef(uid),
    (snapshot) => {
      const results = snapshot.docs.map((d) => d.data())
      results.sort((a, b) => {
        const ta = a.createdAt?.seconds ?? 0
        const tb = b.createdAt?.seconds ?? 0
        return tb - ta
      })
      callback(results)
    },
    (err) => {
      console.error('[Firestore] All Analyses listener error:', err)
      callback([])
    }
  )
}

// ── Prompts (Task 5.2) ────────────────────────────────────────────────────────
// Path: artifacts/{appId}/users/{uid}/prompts/{promptId}
// Hard limit of 3 prompts. Exactly one should have isActive === true.

function promptsRef(uid) {
  return collection(db, 'artifacts', APP_ID, 'users', uid, 'prompts')
}

/**
 * Real-time listener for the user's prompts collection.
 * Returns an unsubscribe function.
 *
 * @param {string}   uid
 * @param {Function} callback — called with array of prompt objects (each with .id)
 * @returns {() => void} unsubscribe
 */
export function listenToPrompts(uid, callback) {
  const ref = query(promptsRef(uid), orderBy('createdAt', 'asc'))
  return onSnapshot(
    ref,
    (snapshot) => {
      const prompts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(prompts)
    },
    (err) => {
      console.error('[Firestore] Prompts listener error:', err)
      callback([])
    }
  )
}

/**
 * Seed the prompts collection with the built-in Editorial Sage default.
 * Only called when the collection is empty.
 *
 * @param {string} uid
 */
export async function seedDefaultPrompt(uid) {
  await addDoc(promptsRef(uid), {
    ...DEFAULT_PROMPT,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Add a new prompt document (auto-generated ID).
 * Callers should enforce the 3-prompt limit before calling.
 *
 * @param {string} uid
 * @param {{ name: string, text: string, isActive: boolean }} prompt
 * @returns {string} new document ID
 */
export async function addPrompt(uid, prompt) {
  const ref = await addDoc(promptsRef(uid), {
    name: prompt.name,
    text: prompt.text,
    isActive: prompt.isActive ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/**
 * Update fields on an existing prompt document.
 *
 * @param {string} uid
 * @param {string} promptId
 * @param {object} fields
 */
export async function updatePrompt(uid, promptId, fields) {
  await updateDoc(doc(promptsRef(uid), promptId), {
    ...fields,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a prompt document.
 *
 * @param {string} uid
 * @param {string} promptId
 */
export async function deletePrompt(uid, promptId) {
  await deleteDoc(doc(promptsRef(uid), promptId))
}

/**
 * Set one prompt as active and deactivate all others.
 * Uses individual updateDoc calls (small collection, ≤3 docs).
 *
 * @param {string}   uid
 * @param {string}   activePromptId
 * @param {string[]} allPromptIds
 */
export async function setActivePrompt(uid, activePromptId, allPromptIds) {
  await Promise.all(
    allPromptIds.map((id) =>
      updateDoc(doc(promptsRef(uid), id), {
        isActive: id === activePromptId,
        updatedAt: serverTimestamp(),
      })
    )
  )
}

/**
 * Fetch the user's active prompt text for use in Gemini calls.
 *
 * Fallback chain:
 *   1. Prompt in the user's collection where isActive === true
 *   2. First prompt in the collection (if none are marked active)
 *   3. Built-in DEFAULT_PROMPT.text (if collection is empty or Firestore fails)
 *
 * @param {string} uid
 * @returns {Promise<string>} prompt text
 */
export async function getActivePrompt(uid) {
  try {
    // Try to find the explicitly active prompt first
    const activeQ = query(promptsRef(uid), where('isActive', '==', true), limit(1))
    const activeSnap = await getDocs(activeQ)

    if (!activeSnap.empty) {
      return activeSnap.docs[0].data().text
    }

    // No active prompt — try to return the first one in the collection
    const allQ = query(promptsRef(uid), orderBy('createdAt', 'asc'), limit(1))
    const allSnap = await getDocs(allQ)

    if (!allSnap.empty) {
      return allSnap.docs[0].data().text
    }

    // Empty collection — use the built-in default
    return DEFAULT_PROMPT.text
  } catch (err) {
    console.warn('[Firestore] getActivePrompt fallback to default:', err)
    return DEFAULT_PROMPT.text
  }
}

// ── Error Logs (Task 5.3) ─────────────────────────────────────────────────────
// Path: artifacts/{appId}/users/{uid}/logs/{logId}
// module values: 'Taddy' | 'AssemblyAI' | 'Gemini'

function logsRef(uid) {
  return collection(db, 'artifacts', APP_ID, 'users', uid, 'logs')
}

/**
 * Write a single error log entry.
 *
 * @param {string} uid
 * @param {'Taddy'|'AssemblyAI'|'Gemini'} module
 * @param {string} message
 */
export async function writeLog(uid, module, message) {
  try {
    await addDoc(logsRef(uid), {
      module,
      message: String(message).slice(0, 2000), // cap length
      timestamp: serverTimestamp(),
    })
  } catch (err) {
    // Non-fatal — never let logging break the app
    console.warn('[Firestore] writeLog failed:', err)
  }
}

/**
 * Real-time listener for the user's error logs, newest-first.
 * Returns an unsubscribe function.
 *
 * @param {string}   uid
 * @param {Function} callback — called with array of log objects (each with .id)
 * @returns {() => void} unsubscribe
 */
export function listenToLogs(uid, callback) {
  const ref = query(logsRef(uid), orderBy('timestamp', 'desc'))
  return onSnapshot(
    ref,
    (snapshot) => {
      const logs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(logs)
    },
    (err) => {
      console.error('[Firestore] Logs listener error:', err)
      callback([])
    }
  )
}
