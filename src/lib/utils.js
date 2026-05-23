// Trigger build: GitHub secrets updated
/**
 * Strips HTML tags from a string and decodes HTML entities.
 * @param {string} htmlString - The HTML string to clean.
 * @returns {string} The plain text content.
 */
export function stripHtml(htmlString) {
  if (!htmlString) return '';
  try {
    const doc = new DOMParser().parseFromString(htmlString, 'text/html');
    return doc.body.textContent || '';
  } catch (e) {
    // Fallback to simple regex if DOMParser fails
    return htmlString.replace(/<[^>]*>/g, '');
  }
}

/**
 * Formats a duration in seconds to a human-readable hours and minutes string.
 * @param {number} seconds - The duration in seconds.
 * @returns {string} The formatted duration (e.g., '1 hr 15 min' or '45 min').
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hrs > 0) {
    return `${hrs} hr ${mins} min`;
  }
  return `${mins} min`;
}
