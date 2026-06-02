const { onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenAI } = require("@google/genai");

const GOOGLE_AI_STUDIO_API_KEY = defineSecret("GOOGLE_AI_STUDIO_API_KEY");
const TADDY_USER_ID = defineSecret("TADDY_USER_ID");
const TADDY_API_KEY = defineSecret("TADDY_API_KEY");
const ASSEMBLY_AI_API_KEY = defineSecret("ASSEMBLY_AI_API_KEY");

const FALLBACK_SYSTEM_PROMPT = `You are Sage, a critical analyst. Evaluate this transcript for weak logic, lazy assumptions, or unearned conclusions. Provide two distinct sections: "Key Takeaways" and "Critical Gaps". Keep the tone sharp, professional, and intellectually rigorous.`

exports.analyzeTranscript = onCall(
  { secrets: [GOOGLE_AI_STUDIO_API_KEY], invoker: 'public' },
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
    const modelId = 'gemini-3.5-flash';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text;
  }
);

// ── Taddy Proxy ───────────────────────────────────────────────────────────────
const TADDY_ENDPOINT = 'https://api.taddy.org';

async function taddyRequest(query, variables, userId, apiKey) {
  const response = await fetch(TADDY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-USER-ID': userId,
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Taddy responded with ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0].message ?? 'GraphQL error from Taddy');
  }

  return json.data;
}

exports.taddySearchPodcasts = onCall(
  { secrets: [TADDY_USER_ID, TADDY_API_KEY], invoker: 'public' },
  async (request) => {
    const { term, limit = 20 } = request.data;
    if (!term) throw new Error("The 'term' parameter is required.");

    const SEARCH_QUERY = `
      query SearchPodcasts($term: String!, $page: Int, $limitPerPage: Int) {
        searchForTerm(
          term: $term
          page: $page
          limitPerPage: $limitPerPage
          filterForTypes: PODCASTSERIES
        ) {
          searchId
          podcastSeries {
            uuid
            name
            description
            imageUrl
            itunesId
          }
        }
      }
    `;

    const data = await taddyRequest(
      SEARCH_QUERY,
      { term, page: 1, limitPerPage: limit },
      TADDY_USER_ID.value(),
      TADDY_API_KEY.value()
    );

    return data?.searchForTerm?.podcastSeries ?? [];
  }
);

exports.taddyGetPodcastSeries = onCall(
  { secrets: [TADDY_USER_ID, TADDY_API_KEY], invoker: 'public' },
  async (request) => {
    const { uuid, limit = 25 } = request.data;
    if (!uuid) throw new Error("The 'uuid' parameter is required.");

    const GET_PODCAST_SERIES_QUERY = `
      query GetPodcastSeries($uuid: ID!, $limitPerPage: Int) {
        getPodcastSeries(uuid: $uuid) {
          uuid
          name
          description
          imageUrl
          episodes(page: 1, limitPerPage: $limitPerPage) {
            uuid
            name
            description
            datePublished
            audioUrl
            duration
          }
        }
      }
    `;

    const data = await taddyRequest(
      GET_PODCAST_SERIES_QUERY,
      { uuid, limitPerPage: limit },
      TADDY_USER_ID.value(),
      TADDY_API_KEY.value()
    );

    return data?.getPodcastSeries ?? null;
  }
);

// ── AssemblyAI Proxy ──────────────────────────────────────────────────────────
const ASSEMBLY_BASE_URL = 'https://api.assemblyai.com/v2';

exports.assemblySubmitTranscription = onCall(
  { secrets: [ASSEMBLY_AI_API_KEY], invoker: 'public' },
  async (request) => {
    const { audioUrl } = request.data;
    if (!audioUrl) throw new Error("The 'audioUrl' parameter is required.");

    const res = await fetch(`${ASSEMBLY_BASE_URL}/transcript`, {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLY_AI_API_KEY.value(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_detection: true,
        speech_model: 'universal-3-pro',
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`AssemblyAI submit failed (${res.status}): ${body}`);
    }

    const json = await res.json();
    if (!json.id) throw new Error('AssemblyAI did not return a transcript ID');
    return json.id;
  }
);

exports.assemblyPollTranscription = onCall(
  { secrets: [ASSEMBLY_AI_API_KEY], invoker: 'public' },
  async (request) => {
    const { jobId } = request.data;
    if (!jobId) throw new Error("The 'jobId' parameter is required.");

    const res = await fetch(`${ASSEMBLY_BASE_URL}/transcript/${jobId}`, {
      headers: {
        'Authorization': ASSEMBLY_AI_API_KEY.value(),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`AssemblyAI poll failed (${res.status})`);
    }

    const json = await res.json();
    return json;
  }
);
