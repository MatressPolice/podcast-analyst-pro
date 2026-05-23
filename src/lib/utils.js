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
