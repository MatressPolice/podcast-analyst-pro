// AssemblyAI transcription client — Task 4.1
// Docs: https://www.assemblyai.com/docs/api-reference
const BASE_URL = 'https://api.assemblyai.com/v2'

function headers() {
  return {
    'Authorization': import.meta.env.VITE_ASSEMBLY_AI_API_KEY,
    'Content-Type':  'application/json',
  }
}

/**
 * Submit an audio URL to AssemblyAI for transcription.
 * @param {string} audioUrl - Public audio stream URL
 * @returns {Promise<string>} The AssemblyAI transcript ID
 */
export async function submitTranscription(audioUrl) {
  const res = await fetch(`${BASE_URL}/transcript`, {
    method:  'POST',
    headers: headers(),
    body:    JSON.stringify({
      audio_url:          audioUrl,
      language_detection: true,   // auto-detect podcast language
      speech_models:      ['universal-3-pro'],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`AssemblyAI submit failed (${res.status}): ${body}`)
  }

  const json = await res.json()
  if (!json.id) throw new Error('AssemblyAI did not return a transcript ID')
  return json.id
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

  for (let i = 0; i < MAX_POLLS; i++) {
    // Honour cancellation before each sleep and after
    if (signal?.aborted) throw new DOMException('Polling aborted', 'AbortError')

    await sleep(POLL_INTERVAL_MS)

    if (signal?.aborted) throw new DOMException('Polling aborted', 'AbortError')

    const res = await fetch(`${BASE_URL}/transcript/${jobId}`, {
      headers: headers(),
    })

    if (!res.ok) {
      throw new Error(`AssemblyAI poll failed (${res.status})`)
    }

    const json = await res.json()

    if (json.status === 'completed') {
      return json.text ?? ''
    }

    if (json.status === 'error') {
      throw new Error(json.error ?? 'AssemblyAI transcription error')
    }

    // 'queued' or 'processing' — keep polling
  }

  throw new Error('Transcription timed out after 10 minutes')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
