import { vi } from 'vitest';

type Handler = unknown | (() => Promise<unknown>);

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

export function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * Replaces global `fetch`. Each route maps a URL to a JSON body, or to a function returning a
 * promise of one (use `deferred()` to control when a response arrives). Unknown URLs fail.
 */
export function mockFetch(routes: Record<string, Handler>) {
  const fn = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (!(url in routes)) {
      throw new TypeError(`Unexpected request: ${url}`);
    }
    const handler = routes[url];
    const body = typeof handler === 'function' ? await (handler as () => Promise<unknown>)() : handler;
    return { ok: true, status: 200, statusText: 'OK', json: async () => body } as Response;
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

export const requestedUrls = (fn: ReturnType<typeof mockFetch>) => fn.mock.calls.map(([url]) => String(url));
