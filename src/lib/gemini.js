import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase.js';

/**
 * Generate an intelligence brief from a transcript using the Firebase Cloud Function.
 *
 * @param {string} transcriptText   - The full episode transcript.
 * @param {string} [systemPrompt]   - Optional system instructions from the user's
 *                                    active Prompt Laboratory selection.
 * @returns {Promise<string>} markdown-formatted brief
 */
export async function generateIntelligenceBrief(transcriptText, systemPrompt) {
  const analyzeTranscript = httpsCallable(functions, 'analyzeTranscript');

  const response = await analyzeTranscript({
    transcriptText,
    systemPrompt,
  });

  return response.data;
}
