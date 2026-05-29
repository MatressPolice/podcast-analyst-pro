import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { stripHtml } from './utils.js';

describe('stripHtml', () => {
  it('should return empty string for falsy inputs', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml(null)).toBe('');
    expect(stripHtml(undefined)).toBe('');
  });

  it('should return the same string if there is no HTML', () => {
    const text = 'Hello world, this is a normal string.';
    expect(stripHtml(text)).toBe(text);
  });

  it('should strip basic HTML tags', () => {
    const html = '<p>Hello <b>world</b></p>';
    expect(stripHtml(html)).toBe('Hello world');
  });

  it('should strip nested HTML tags', () => {
    const html = '<div><p>Testing <span>nested</span> tags</p></div>';
    expect(stripHtml(html)).toBe('Testing nested tags');
  });

  it('should handle complex HTML with attributes', () => {
    const html = '<a href="https://example.com" class="link">Click me</a>';
    expect(stripHtml(html)).toBe('Click me');
  });

  it('should decode HTML entities', () => {
    const html = 'Hello &amp; welcome to the &lt;b&gt;jungle&lt;/b&gt;!';
    // DOMParser correctly decodes &amp; to &, and &lt; to <, etc.
    expect(stripHtml(html)).toBe('Hello & welcome to the <b>jungle</b>!');
  });

  describe('fallback mechanism', () => {
    let originalDOMParser;

    beforeEach(() => {
      // Save original to restore later
      originalDOMParser = global.DOMParser;
    });

    afterEach(() => {
      // Restore original
      global.DOMParser = originalDOMParser;
    });

    it('should use regex fallback if DOMParser throws an error', () => {
      // Mock DOMParser to throw an error
      global.DOMParser = class {
        parseFromString() {
          throw new Error('Mocked error');
        }
      };

      const html = '<p>Fallback <b>test</b></p>';
      expect(stripHtml(html)).toBe('Fallback test');
    });

    it('should use regex fallback if DOMParser is undefined', () => {
      // Setup environment where DOMParser is undefined
      global.DOMParser = undefined;

      const html = '<p>Fallback <b>test</b></p>';
      expect(stripHtml(html)).toBe('Fallback test');
    });

    it('fallback should still strip tags but will not decode HTML entities as effectively', () => {
      global.DOMParser = undefined;
      const html = 'Hello &amp; welcome &lt;test&gt;';
      // The regex fallback doesn't decode entities, it just strips tags.
      // So &lt;test&gt; is not considered a tag by the regex since it's just characters.
      expect(stripHtml(html)).toBe('Hello &amp; welcome &lt;test&gt;');
    });
  });
});
