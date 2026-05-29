const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");

initializeApp();

const ASSEMBLY_AI_BASE_URL = 'https://api.assemblyai.com/v2';

function getHeaders() {
  const apiKey = process.env.VITE_ASSEMBLY_AI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_ASSEMBLY_AI_API_KEY environment variable is not set');
  }
  return {
    'Authorization': apiKey,
    'Content-Type': 'application/json',
  };
}

exports.submitTranscription = onCall(async (request) => {
  // Check if the user is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { audioUrl } = request.data;
  if (!audioUrl) {
    throw new HttpsError('invalid-argument', 'The function must be called with one argument "audioUrl" containing the url to transcribe.');
  }

  try {
    const res = await fetch(`${ASSEMBLY_AI_BASE_URL}/transcript`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        audio_url: audioUrl,
        language_detection: true, // auto-detect podcast language
        speech_models: ['universal-3-pro'],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new HttpsError('internal', `AssemblyAI submit failed (${res.status}): ${body}`);
    }

    const json = await res.json();
    if (!json.id) {
        throw new HttpsError('internal', 'AssemblyAI did not return a transcript ID');
    }
    return { id: json.id };
  } catch (err) {
    console.error('Error submitting transcription to AssemblyAI:', err);
    if (err instanceof HttpsError) {
        throw err;
    }
    throw new HttpsError('internal', 'Failed to submit transcription to AssemblyAI');
  }
});

exports.pollTranscription = onCall(async (request) => {
    // Check if the user is authenticated
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const { jobId } = request.data;
    if (!jobId) {
      throw new HttpsError('invalid-argument', 'The function must be called with one argument "jobId" containing the AssemblyAI transcript ID.');
    }

    try {
      const res = await fetch(`${ASSEMBLY_AI_BASE_URL}/transcript/${jobId}`, {
        headers: getHeaders(),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new HttpsError('internal', `AssemblyAI poll failed (${res.status}): ${body}`);
      }

      const json = await res.json();

      // Return the current status and potentially text or error
      return {
          status: json.status,
          text: json.text ?? null,
          error: json.error ?? null
      };
    } catch (err) {
      console.error('Error polling transcription from AssemblyAI:', err);
      if (err instanceof HttpsError) {
          throw err;
      }
      throw new HttpsError('internal', 'Failed to poll transcription from AssemblyAI');
    }
  });
