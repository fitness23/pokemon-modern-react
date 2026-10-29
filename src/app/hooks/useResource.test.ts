import { act, renderHook, waitFor } from '@testing-library/react';
import { useResource } from './useResource';
import { deferred } from '../testing/mockFetch';

describe('useResource', () => {
  it('should stay idle without calling the loader while disabled', () => {
    const loader = vi.fn(async () => ['x']);

    const { result } = renderHook(() => useResource<string[], void>({ enabled: false, loader, defaultValue: [] }));

    expect(result.current.status).toBe('idle');
    expect(result.current.value).toEqual([]);
    expect(loader).not.toHaveBeenCalled();
  });

  it('should load the value and expose the loading state', async () => {
    const response = deferred<string[]>();

    const { result } = renderHook(() => useResource<string[], void>({ loader: () => response.promise, defaultValue: [] }));
    expect(result.current.isLoading).toBe(true);

    await act(async () => response.resolve(['a']));

    expect(result.current.value).toEqual(['a']);
    expect(result.current.status).toBe('resolved');
    expect(result.current.isLoading).toBe(false);
  });

  it('should fall back to the default value and expose the error when the loader fails', async () => {
    const { result } = renderHook(() =>
      useResource<string[], void>({ loader: () => Promise.reject(new Error('boom')), defaultValue: [] }),
    );

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.value).toEqual([]);
    expect((result.current.error as Error).message).toBe('boom');
  });

  it('should reset the value on new params but keep it on reload', async () => {
    const second = deferred<string>();
    const reloaded = deferred<string>();
    const loader = vi
      .fn<(p: string) => Promise<string>>()
      .mockResolvedValueOnce('one')
      .mockImplementationOnce(() => second.promise)
      .mockImplementationOnce(() => reloaded.promise);

    const { result, rerender } = renderHook(
      ({ id }) => useResource<string, string>({ params: id, loader, defaultValue: '' }),
      { initialProps: { id: 'a' } },
    );
    await waitFor(() => expect(result.current.value).toBe('one'));

    rerender({ id: 'b' });
    await waitFor(() => expect(result.current.status).toBe('loading'));
    expect(result.current.value).toBe('');
    await act(async () => second.resolve('two'));
    expect(result.current.value).toBe('two');

    act(() => result.current.reload());
    await waitFor(() => expect(result.current.status).toBe('reloading'));
    expect(result.current.value).toBe('two');
    await act(async () => reloaded.resolve('three'));
    expect(result.current.value).toBe('three');
  });

  it('should ignore the result of a request that was superseded', async () => {
    const stale = deferred<string>();
    const loader = vi
      .fn<(p: string) => Promise<string>>()
      .mockImplementationOnce(() => stale.promise)
      .mockResolvedValueOnce('fresh');

    const { result, rerender } = renderHook(
      ({ id }) => useResource<string, string>({ params: id, loader, defaultValue: '' }),
      { initialProps: { id: 'a' } },
    );
    rerender({ id: 'b' });
    await waitFor(() => expect(result.current.value).toBe('fresh'));

    await act(async () => stale.resolve('stale'));

    expect(result.current.value).toBe('fresh');
  });
});
