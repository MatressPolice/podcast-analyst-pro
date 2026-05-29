const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

const TADDY_ENDPOINT = 'https://api.taddy.org';

async function taddyRequest(query, variables = {}) {
  const userId = process.env.TADDY_USER_ID;
  const apiKey = process.env.TADDY_API_KEY;

  if (!userId || !apiKey) {
    throw new HttpsError('internal', 'Taddy API credentials are not configured.');
  }

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
    throw new HttpsError('internal', `Taddy responded with ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors?.length) {
    throw new HttpsError('internal', json.errors[0].message ?? 'GraphQL error from Taddy');
  }

  return json.data;
}

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

exports.searchPodcasts = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { term, limit = 20 } = request.data;

  if (!term || typeof term !== 'string') {
    throw new HttpsError('invalid-argument', 'The function must be called with a valid "term" string.');
  }

  try {
    const data = await taddyRequest(SEARCH_QUERY, { term, page: 1, limitPerPage: limit });
    return data?.searchForTerm?.podcastSeries ?? [];
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});

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

exports.getPodcastSeries = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { podcastUuid, limit = 25 } = request.data;

  if (!podcastUuid || typeof podcastUuid !== 'string') {
    throw new HttpsError('invalid-argument', 'The function must be called with a valid "podcastUuid" string.');
  }

  try {
    const data = await taddyRequest(GET_PODCAST_SERIES_QUERY, {
      uuid: podcastUuid,
      limitPerPage: limit,
    });
    return data?.getPodcastSeries ?? null;
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});
