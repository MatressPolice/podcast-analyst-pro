import { useEffect, useRef, useState } from 'react'
import { createAnalysis, updateAnalysis, listenToAnalysis, getActivePrompt } from '../lib/firestore'
import { submitTranscription, pollTranscription } from '../lib/assemblyai'
import { generateIntelligenceBrief } from '../lib/gemini'

/**
 * Task 4.1 — Analysis orchestration hook.
 *
 * Manages the full lifecycle of an episode analysis:
 *   queued → processing → completed | error
 *
 * Key design:
 * • A real-time Firestore listener drives all UI state — the hook never derives
 *   status from local variables, so closing/reopening the panel resumes correctly.
 * • Polling auto-resumes if the panel reopens while status is 'processing'.
 * • AbortController cancels the in-flight poll on unmount / episode change.
 *
 * @param {string|null} episodeUuid
 * @param {string|null} uid
 */
export function useAnalysis(episodeUuid, uid) {
  const [analysis, setAnalysis] = useState(null)
  const isPollingRef  = useRef(false)
  const abortCtrlRef  = useRef(null)
  const geminiRef     = useRef(false)

  // ── Real-time Firestore listener ─────────────────────────────────────────────
  useEffect(() => {
    if (!episodeUuid || !uid) {
      setAnalysis(null)
      return
    }
    const unsubscribe = listenToAnalysis(uid, episodeUuid, setAnalysis)
    return unsubscribe
  }, [episodeUuid, uid])

  // ── Auto-resume polling when status is 'processing' ──────────────────────────
  // Runs whenever assemblyJobId appears or changes. Guards against double-start.
  useEffect(() => {
    if (
      analysis?.status !== 'processing' ||
      !analysis?.assemblyJobId          ||
      isPollingRef.current
    ) return

    const controller = new AbortController()
    abortCtrlRef.current  = controller
    isPollingRef.current  = true

    pollTranscription(analysis.assemblyJobId, controller.signal)
      .then(async (text) => {
        if (!controller.signal.aborted) {
          await updateAnalysis(uid, episodeUuid, {
            status:         'completed',
            transcriptText: text,
          })
        }
      })
      .catch(async (err) => {
        if (!controller.signal.aborted) {
          console.error('[Analysis] Poll failed:', err)
          await updateAnalysis(uid, episodeUuid, {
            status: 'error',
            error:  err.message,
          })
        }
      })
      .finally(() => {
        isPollingRef.current = false
      })

    return () => {
      controller.abort()
      isPollingRef.current = false
    }
  }, [analysis?.assemblyJobId, analysis?.status, uid, episodeUuid])

  // ── Auto-resume Gemini when transcript is completed ──────────────────────────
  useEffect(() => {
    if (
      analysis?.status !== 'completed' ||
      !analysis?.transcriptText ||
      geminiRef.current
    ) return

    geminiRef.current = true

    // Fetch the user's active prompt first, with graceful fallback to Editorial Sage
    getActivePrompt(uid)
      .then((systemPrompt) => generateIntelligenceBrief(analysis.transcriptText, systemPrompt))
      .then(async (brief) => {
        await updateAnalysis(uid, episodeUuid, {
          status: 'analyzed',
          analysisResult: brief,
        })
      })
      .catch(async (err) => {
        console.error('[Gemini] Analysis failed:', err)
        // Keep state machine simple — go to error so user can retry.
        await updateAnalysis(uid, episodeUuid, {
          status: 'error',
          error:  `AI Analysis failed: ${err.message}`,
        })
      })
      .finally(() => {
        geminiRef.current = false
      })
  }, [analysis?.status, analysis?.transcriptText, uid, episodeUuid])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortCtrlRef.current?.abort()
    }
  }, [])

  // ── Begin Analysis ────────────────────────────────────────────────────────────
  /**
   * Called when the user clicks "Begin Analysis".
   * Idempotent: no-ops if already queued or processing.
   *
   * @param {string} audioUrl
   * @param {string} episodeName
   * @param {string} podcastUuid
   * @param {string} podcastName
   * @param {string} podcastImageUrl
   * @param {number} episodeReleaseDate
   */
  async function beginAnalysis(audioUrl, episodeName, podcastUuid, podcastName, podcastImageUrl, episodeReleaseDate) {
    // Guard: don't restart if already in-flight
    if (analysis?.status === 'queued' || analysis?.status === 'processing') return

    try {
      // 1. Create/reset the Firestore doc → status: 'queued'
      await createAnalysis(uid, episodeUuid, {
        episodeName,
        podcastUuid,
        podcastName: podcastName ?? 'Unknown Podcast',
        podcastImageUrl: podcastImageUrl ?? '',
        episodeReleaseDate: episodeReleaseDate ?? 0,
        audioUrl,
        status: 'queued',
      })

      // 2. Submit to AssemblyAI
      const jobId = await submitTranscription(audioUrl)

      // 3. Update to 'processing' with the job ID so auto-resume can pick it up
      await updateAnalysis(uid, episodeUuid, {
        status:        'processing',
        assemblyJobId: jobId,
      })

      // Polling starts automatically via the useEffect above
    } catch (err) {
      console.error('[Analysis] Begin failed:', err)
      await updateAnalysis(uid, episodeUuid, {
        status: 'error',
        error:  err.message,
      }).catch(() => {}) // best-effort — original error is more important
    }
  }

  return { analysis, beginAnalysis }
}
