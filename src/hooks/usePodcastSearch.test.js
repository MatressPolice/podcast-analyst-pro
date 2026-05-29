import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePodcastSearch } from './usePodcastSearch';
import { searchPodcasts } from '../lib/taddy';

// Mock the API call
vi.mock('../lib/taddy', () => ({
  searchPodcasts: vi.fn(),
}));

describe('usePodcastSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    try {
      vi.runOnlyPendingTimers();
    } catch (e) {
      // Ignore if timers are not mocked
    }
    vi.useRealTimers();
  });

  it('returns idle status and empty results for empty query', () => {
    const { result } = renderHook(() => usePodcastSearch(''));

    expect(result.current.status).toBe('idle');
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(searchPodcasts).not.toHaveBeenCalled();
  });

  it('returns idle status and empty results for whitespace query', () => {
    const { result } = renderHook(() => usePodcastSearch('   '));

    expect(result.current.status).toBe('idle');
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(searchPodcasts).not.toHaveBeenCalled();
  });

  it('debounces the search call and handles successful response', async () => {
    const mockData = [{ uuid: '1', name: 'Test Podcast' }];
    searchPodcasts.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => usePodcastSearch('react'));

    expect(result.current.status).toBe('idle');

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.status).toBe('loading');
    expect(searchPodcasts).toHaveBeenCalledWith('react');

    // Need to flush promises since we mocked an async function and fake timers block nextTick
    vi.useRealTimers();

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.results).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('debounces multiple rapid query changes', async () => {
    const mockData = [{ uuid: '1', name: 'Test Podcast' }];
    searchPodcasts.mockResolvedValueOnce(mockData);

    const { result, rerender } = renderHook(({ query }) => usePodcastSearch(query), {
      initialProps: { query: 're' },
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ query: 'reac' });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ query: 'react' });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(searchPodcasts).toHaveBeenCalledTimes(1);
    expect(searchPodcasts).toHaveBeenCalledWith('react');

    vi.useRealTimers();

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
  });

  it('handles API errors', async () => {
    const errorMessage = 'API connection failed';
    searchPodcasts.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => usePodcastSearch('error'));

    act(() => {
      vi.advanceTimersByTime(400);
    });

    vi.useRealTimers();

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.results).toEqual([]);
  });

  it('ignores AbortError correctly', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    searchPodcasts.mockRejectedValueOnce(abortError);

    const { result } = renderHook(() => usePodcastSearch('abort'));

    act(() => {
      vi.advanceTimersByTime(400);
    });

    vi.useRealTimers();

    // Since AbortError is ignored, it stays loading in our simple test because
    // nothing sets it to another state when ignored.
    await act(async () => {
        await Promise.resolve(); // flush
        await new Promise(r => setTimeout(r, 10)); // flush more
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.error).toBeNull();
  });
});
