import { useCallback, useEffect, useRef, useState } from 'react';

export type ResourceStatus = 'idle' | 'loading' | 'reloading' | 'resolved' | 'error';

export interface ResourceOptions<T, P> {
  /** Passed to the loader; a change to it starts a new load and resets the value. */
  params?: P;
  /** When false the resource stays idle and no request is made. Defaults to true. */
  enabled?: boolean;
  loader: (params: P, signal: AbortSignal) => Promise<T>;
  defaultValue: T;
}

export interface Resource<T> {
  /** The latest loaded value, or the default while idle, loading or failed. */
  value: T;
  status: ResourceStatus;
  isLoading: boolean;
  error: unknown;
  /** Runs the loader again with the same params, keeping the current value meanwhile. */
  reload: () => void;
}

/**
 * Small React counterpart of Angular's `rxResource`: loads async data, stays idle
 * until it is enabled, cancels stale requests, and never throws while reading the
 * value (a failed load just falls back to the default value).
 */
export function useResource<T, P = void>(options: ResourceOptions<T, P>): Resource<T> {
  const { params, enabled = true, defaultValue } = options;
  const loaderRef = useRef(options.loader);
  loaderRef.current = options.loader;
  const defaultRef = useRef(defaultValue);

  const [state, setState] = useState<{ value: T; status: ResourceStatus; error: unknown }>({
    value: defaultValue,
    status: enabled ? 'loading' : 'idle',
    error: undefined,
  });
  const [reloadCount, setReloadCount] = useState(0);
  const lastLoad = useRef<{ params: P | undefined; enabled: boolean; reloadCount: number } | null>(null);

  useEffect(() => {
    const previous = lastLoad.current;
    lastLoad.current = { params, enabled, reloadCount };

    if (!enabled) {
      setState({ value: defaultRef.current, status: 'idle', error: undefined });
      return;
    }

    // A reload keeps the old value; new params reset it, like rxResource.
    const isReload =
      previous !== null && previous.enabled && Object.is(previous.params, params) && previous.reloadCount !== reloadCount;
    setState(s => ({
      value: isReload ? s.value : defaultRef.current,
      status: isReload ? 'reloading' : 'loading',
      error: undefined,
    }));

    const controller = new AbortController();
    loaderRef.current(params as P, controller.signal).then(
      value => {
        if (!controller.signal.aborted) setState({ value, status: 'resolved', error: undefined });
      },
      error => {
        if (!controller.signal.aborted) setState({ value: defaultRef.current, status: 'error', error });
      },
    );
    return () => controller.abort();
  }, [params, enabled, reloadCount]);

  const reload = useCallback(() => setReloadCount(c => c + 1), []);

  return {
    value: state.value,
    status: state.status,
    isLoading: state.status === 'loading' || state.status === 'reloading',
    error: state.error,
    reload,
  };
}
