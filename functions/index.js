const { onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenAI } = require("@google/genai");

const GOOGLE_AI_STUDIO_API_KEY = defineSecret("GOOGLE_AI_STUDIO_API_KEY");

const FALLBACK_SYSTEM_PROMPT = `You are Sage, a critical analyst. Evaluate this transcript for weak logic, lazy assumptions, or unearned conclusions. Provide two distinct sections: "Key Takeaways" and "Critical Gaps". Keep the tone sharp, professional, and intellectually rigorous.`

exports.analyzeTranscript = onCall(
  { secrets: [GOOGLE_AI_STUDIO_API_KEY] },
  async (request) => {
    const transcriptText = request.data.transcriptText;
    const systemPrompt = request.data.systemPrompt;

    if (!transcriptText) {
      throw new Error("The 'transcriptText' parameter is required.");
    }

    const ai = new GoogleGenAI({
      apiKey: GOOGLE_AI_STUDIO_API_KEY.value(),
      httpOptions: { apiVersion: 'v1beta' },
    });

    const instructions = systemPrompt?.trim() || FALLBACK_SYSTEM_PROMPT;
    const prompt = `${instructions}\n\nTranscript:\n${transcriptText}\n`;
    const modelId = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text;
  }
);
