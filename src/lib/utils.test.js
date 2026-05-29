import { describe, it, expect } from 'vitest';
import { formatDuration } from './utils.js';

describe('formatDuration', () => {
  it('returns empty string for null, undefined, NaN, or non-numeric inputs', () => {
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(undefined)).toBe('');
    expect(formatDuration(NaN)).toBe('');
    expect(formatDuration(0)).toBe('');
    expect(formatDuration('')).toBe('');
    expect(formatDuration('abc')).toBe('');
  });

  it('formats less than 60 seconds as 0 min', () => {
    expect(formatDuration(30)).toBe('0 min');
    expect(formatDuration(59)).toBe('0 min');
  });

  it('formats exactly 1 minute', () => {
    expect(formatDuration(60)).toBe('1 min');
  });

  it('formats minutes only (less than 1 hour)', () => {
    expect(formatDuration(180)).toBe('3 min');
    expect(formatDuration(3599)).toBe('59 min');
  });

  it('formats exact hours', () => {
    expect(formatDuration(3600)).toBe('1 hr 0 min');
    expect(formatDuration(7200)).toBe('2 hr 0 min');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(3660)).toBe('1 hr 1 min');
    expect(formatDuration(5400)).toBe('1 hr 30 min');
    expect(formatDuration(9000)).toBe('2 hr 30 min');
  });
});
