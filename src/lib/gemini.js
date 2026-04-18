import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_AI_STUDIO_API_KEY,
  httpOptions: { apiVersion: 'v1beta' },
});

export async function generateIntelligenceBrief(transcriptText) {
  const prompt = `You are Sage, a critical analyst. Evaluate this transcript for weak logic, lazy assumptions, or unearned conclusions. Provide two distinct sections: "Key Takeaways" and "Critical Gaps". Keep the tone sharp, professional, and intellectually rigorous.

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
