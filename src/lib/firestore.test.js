import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getActivePrompt, DEFAULT_PROMPT } from './firestore.js'
import { getDocs } from 'firebase/firestore'

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    orderBy: vi.fn(),
    getDocs: vi.fn(),
  }
})

vi.mock('./firebase', () => ({
  db: {}
}))

describe('getActivePrompt', () => {
  let consoleWarnSpy;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleWarnSpy.mockRestore();
  });

  it('returns explicitly active prompt text', async () => {
    getDocs.mockResolvedValueOnce({
      empty: false,
      docs: [{ data: () => ({ text: 'Active Prompt' }) }]
    });

    const result = await getActivePrompt('uid-active');
    expect(result).toBe('Active Prompt');
  });

  it('returns first prompt if no explicitly active prompt exists', async () => {
    getDocs
      .mockResolvedValueOnce({ empty: true }) // First call (active query)
      .mockResolvedValueOnce({
        empty: false,
        docs: [{ data: () => ({ text: 'First Prompt' }) }] // Second call (all query)
      });

    const result = await getActivePrompt('uid-first');
    expect(result).toBe('First Prompt');
  });

  it('returns DEFAULT_PROMPT.text if collection is empty', async () => {
    getDocs
      .mockResolvedValueOnce({ empty: true })
      .mockResolvedValueOnce({ empty: true });

    const result = await getActivePrompt('uid-empty');
    expect(result).toBe(DEFAULT_PROMPT.text);
  });

  it('returns DEFAULT_PROMPT.text when getDocs throws an exception', async () => {
    getDocs.mockRejectedValue(new Error('Firestore error'));

    const result = await getActivePrompt('uid-error');

    expect(result).toBe(DEFAULT_PROMPT.text);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Firestore] getActivePrompt fallback to default:',
      expect.any(Error)
    );
  });
});
