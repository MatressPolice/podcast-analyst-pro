// Taddy GraphQL client — Task 2.3 / 3.1
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase.js';

/**
 * Search Taddy for podcast series matching the given term via Cloud Function.
 * @param {string} term   - Search string
 * @param {number} limit  - Max results (default 20)
 * @returns {Promise<Array>} Array of podcast series objects
 */
export async function searchPodcasts(term, limit = 20) {
  const taddySearchPodcastsFn = httpsCallable(functions, 'taddySearchPodcasts');
  const response = await taddySearchPodcastsFn({ term, limit });
  return response.data;
}

/**
 * Fetch a podcast series with its most recent episodes via Cloud Function.
 * Episode `name` field maps to the episode title in the Taddy schema.
 *
 * @param {string} podcastUuid
 * @param {number} limit - Max episodes to return (default 25, Taddy hard cap)
 * @returns {Promise<object|null>} Series object with nested episodes array
 */
export async function getPodcastSeries(podcastUuid, limit = 25) {
  const taddyGetPodcastSeriesFn = httpsCallable(functions, 'taddyGetPodcastSeries');
  const response = await taddyGetPodcastSeriesFn({ uuid: podcastUuid, limit });
  return response.data;
}
