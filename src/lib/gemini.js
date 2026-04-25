import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_AI_STUDIO_API_KEY,
  httpOptions: { apiVersion: 'v1beta' },
});

const FALLBACK_SYSTEM_PROMPT = `You are Sage, a critical analyst. Evaluate this transcript for weak logic, lazy assumptions, or unearned conclusions. Provide two distinct sections: "Key Takeaways" and "Critical Gaps". Keep the tone sharp, professional, and intellectually rigorous.`

/**
 * Generate an intelligence brief from a transcript.
 *
 * @param {string} transcriptText   - The full episode transcript.
 * @param {string} [systemPrompt]   - Optional system instructions from the user's
 *                                    active Prompt Laboratory selection. Falls back
 *                                    to the built-in Editorial Sage prompt.
 * @returns {Promise<string>} markdown-formatted brief
 */
export async function generateIntelligenceBrief(transcriptText, systemPrompt) {
  const instructions = systemPrompt?.trim() || FALLBACK_SYSTEM_PROMPT

  const prompt = `${instructions}

Transcript:
${transcriptText}
`;

  const modelId = 'gemini-3-flash-preview';
  console.log('Attempting Gemini call with:', modelId);

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
  });

  return response.text;
}
