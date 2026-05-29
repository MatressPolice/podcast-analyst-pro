import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'

/**
 * Submit an audio URL to AssemblyAI for transcription via Firebase Functions.
 * @param {string} audioUrl - Public audio stream URL
 * @returns {Promise<string>} The AssemblyAI transcript ID
 */
export async function submitTranscription(audioUrl) {
  const submitFn = httpsCallable(functions, 'submitTranscription')
  const result = await submitFn({ audioUrl })
  return result.data.id
}

/**
 * Poll an AssemblyAI transcript until it is completed or errors out.
 * Uses recursive setTimeout so the caller can abort via AbortSignal.
 *
 * @param {string} jobId          - AssemblyAI transcript ID
 * @param {AbortSignal} [signal]  - Optional abort signal for cleanup
 * @returns {Promise<string>}     - The completed transcript text
 */
export async function pollTranscription(jobId, signal) {
  const POLL_INTERVAL_MS = 5_000  // 5 s between polls
  const MAX_POLLS        = 120    // max 10 min before timing out
  const pollFn = httpsCallable(functions, 'pollTranscription')

  for (let i = 0; i < MAX_POLLS; i++) {
    // Honour cancellation before each sleep and after
    if (signal?.aborted) throw new DOMException('Polling aborted', 'AbortError')

    await sleep(POLL_INTERVAL_MS)

    if (signal?.aborted) throw new DOMException('Polling aborted', 'AbortError')

    const result = await pollFn({ jobId })
    const data = result.data

    if (data.status === 'completed') {
      return data.text ?? ''
    }

    if (data.status === 'error') {
      throw new Error(data.error ?? 'AssemblyAI transcription error')
    }

    // 'queued' or 'processing' — keep polling
  }

  throw new Error('Transcription timed out after 10 minutes')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
