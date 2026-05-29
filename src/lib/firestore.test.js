import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { listenToAllAnalyses, getActivePrompt, DEFAULT_PROMPT } from './firestore.js';
import { onSnapshot, getDocs } from 'firebase/firestore';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    onSnapshot: vi.fn(),
    collection: vi.fn(),
    doc: vi.fn(),
    setDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    serverTimestamp: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    writeBatch: vi.fn(),
  };
});

vi.mock('./firebase', () => ({
  db: {}
}));

describe('listenToAllAnalyses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sorts analyses descending by createdAt.seconds', () => {
    const mockCallback = vi.fn();
    const mockData = [
      { id: '1', createdAt: { seconds: 100 } },
      { id: '2', createdAt: { seconds: 300 } },
      { id: '3', createdAt: { seconds: 200 } },
    ];

    onSnapshot.mockImplementation((ref, callback) => {
      callback({
        docs: mockData.map(data => ({ data: () => data }))
      });
      return vi.fn(); // mock unsubscribe
    });

    listenToAllAnalyses('test-uid', mockCallback);

    expect(onSnapshot).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    const results = mockCallback.mock.calls[0][0];
    expect(results).toEqual([
      { id: '2', createdAt: { seconds: 300 } },
      { id: '3', createdAt: { seconds: 200 } },
      { id: '1', createdAt: { seconds: 100 } },
    ]);
  });

  it('handles documents with missing createdAt', () => {
    const mockCallback = vi.fn();
    const mockData = [
      { id: '1', createdAt: { seconds: 100 } },
      { id: '2' }, // Missing createdAt entirely
      { id: '3', createdAt: { seconds: 50 } },
    ];

    onSnapshot.mockImplementation((ref, callback) => {
      callback({
        docs: mockData.map(data => ({ data: () => data }))
      });
      return vi.fn();
    });

    listenToAllAnalyses('test-uid', mockCallback);

    const results = mockCallback.mock.calls[0][0];
    expect(results).toEqual([
      { id: '1', createdAt: { seconds: 100 } },
      { id: '3', createdAt: { seconds: 50 } },
      { id: '2' }, // defaults to 0
    ]);
  });

  it('handles documents with missing seconds in createdAt', () => {
    const mockCallback = vi.fn();
    const mockData = [
      { id: '1', createdAt: {} }, // Missing seconds
      { id: '2', createdAt: { seconds: 100 } },
    ];

    onSnapshot.mockImplementation((ref, callback) => {
      callback({
        docs: mockData.map(data => ({ data: () => data }))
      });
      return vi.fn();
    });

    listenToAllAnalyses('test-uid', mockCallback);

    const results = mockCallback.mock.calls[0][0];
    expect(results).toEqual([
      { id: '2', createdAt: { seconds: 100 } },
      { id: '1', createdAt: {} }, // defaults to 0
    ]);
  });

  it('maintains original order for identical seconds', () => {
    const mockCallback = vi.fn();
    const mockData = [
      { id: '1', createdAt: { seconds: 100 } },
      { id: '2', createdAt: { seconds: 100 } },
      { id: '3', createdAt: { seconds: 200 } },
    ];

    onSnapshot.mockImplementation((ref, callback) => {
      callback({
        docs: mockData.map(data => ({ data: () => data }))
      });
      return vi.fn();
    });

    listenToAllAnalyses('test-uid', mockCallback);

    const results = mockCallback.mock.calls[0][0];
    // id '3' goes first, then '1' and '2' keep their relative order
    expect(results).toEqual([
      { id: '3', createdAt: { seconds: 200 } },
      { id: '1', createdAt: { seconds: 100 } },
      { id: '2', createdAt: { seconds: 100 } },
    ]);
  });
});

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
