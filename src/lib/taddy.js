import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// Taddy GraphQL client — Task 2.3 / 3.1
// Moved to Cloud Functions to keep API keys secure

/**
 * Search Taddy for podcast series matching the given term.
 * @param {string} term   - Search string
 * @param {number} limit  - Max results (default 20)
 * @returns {Promise<Array>} Array of podcast series objects
 */
export async function searchPodcasts(term, limit = 20) {
  const searchPodcastsFn = httpsCallable(functions, 'searchPodcasts');
  try {
    const result = await searchPodcastsFn({ term, limit });
    return result.data;
  } catch (error) {
    console.error('Error searching podcasts via Cloud Function:', error);
    throw new Error(error.message || 'Error searching podcasts');
  }
}

/**
 * Fetch a podcast series with its most recent episodes.
 * Episode `name` field maps to the episode title in the Taddy schema.
 *
 * @param {string} podcastUuid
 * @param {number} limit - Max episodes to return (default 25, Taddy hard cap)
 * @returns {Promise<object|null>} Series object with nested episodes array
 */
export async function getPodcastSeries(podcastUuid, limit = 25) {
  const getPodcastSeriesFn = httpsCallable(functions, 'getPodcastSeries');
  try {
    const result = await getPodcastSeriesFn({ podcastUuid, limit });
    return result.data;
  } catch (error) {
    console.error('Error fetching podcast series via Cloud Function:', error);
    throw new Error(error.message || 'Error fetching podcast series');
  }
}
