import 'server-only';
import { hasApiKey } from './client';

/**
 * Single message shown when `ROXYAPI_KEY` is unset. The page boundary renders the `ApiKeyMissing` component instead of throwing this, but `unwrap` falls back to it for any call that slips through without a key (e.g. a route handler).
 */
export const NO_KEY =
  'ROXYAPI_KEY is not set. Add it to .env.local and restart the dev server. Get a key at roxyapi.com/pricing.';

/**
 * The success/error envelope every `@roxyapi/sdk` method resolves to. `data` is the typed response on success, `error` is the typed API error on failure: the two are mutually exclusive. The SDK error always carries a stable `code` and a human-readable `error` string.
 */
interface SdkResult<T> {
  data?: T;
  error?: { error?: string; code?: string } | undefined;
}

/**
 * Maps the stable `error.code` from the SDK error table to a message a forker can act on without leaking internals. Unknown codes fall back to the server-provided `error` string.
 *
 * @see The error contract in `node_modules/@roxyapi/sdk/AGENTS.md`.
 */
function messageForCode(code: string | undefined, fallback: string | undefined): string {
  switch (code) {
    case 'validation_error':
      return 'The request was rejected as invalid. Check the birth date, time, and coordinates.';
    case 'api_key_required':
    case 'invalid_api_key':
      return NO_KEY;
    case 'subscription_not_found':
    case 'subscription_inactive':
      return 'This API key has no active subscription. Renew at roxyapi.com/account.';
    case 'rate_limit_exceeded':
      return 'Monthly request quota reached. Upgrade your plan at roxyapi.com/pricing.';
    case 'not_found':
      return 'The requested resource was not found.';
    default:
      return fallback ?? 'The request to RoxyAPI failed. Please try again.';
  }
}

/**
 * Awaits one SDK call, returns its `data`, and throws a clear `Error` on failure. Every Server Component and Server Action calls this instead of re-implementing the `if (error) throw` and missing-key dance.
 *
 * @example
 * ```ts
 * const panchang = await unwrap(roxy.vedicAstrology.getDetailedPanchang({ body, query: { lang } }));
 * ```
 *
 * @param call - The unawaited promise returned by any `roxy.*` method.
 * @returns The unwrapped, typed response `data`.
 * @throws {Error} {@link NO_KEY} when no key is configured, or a code-mapped message when the API returns an error.
 */
export async function unwrap<T>(call: Promise<SdkResult<T>>): Promise<T> {
  if (!hasApiKey) throw new Error(NO_KEY);
  const { data, error } = await call;
  if (error) throw new Error(messageForCode(error.code, error.error));
  return data as T;
}

/**
 * Non-throwing variant of {@link unwrap} for Server Components. Returns a discriminated result so the page can branch in JSX without a try/catch (constructing JSX inside try/catch is an anti-pattern: render errors escape it).
 *
 * @example
 * ```tsx
 * const result = await tryUnwrap(roxy.vedicAstrology.getDetailedPanchang({ body, query: { lang } }));
 * return 'error' in result ? <DataError message={result.error} /> : <PanchangView data={result.data} />;
 * ```
 */
export async function tryUnwrap<T>(
  call: Promise<SdkResult<T>>,
): Promise<{ data: T } | { error: string }> {
  try {
    return { data: await unwrap(call) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'The request to RoxyAPI failed.' };
  }
}
