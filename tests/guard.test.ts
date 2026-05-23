import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Tests for the `unwrap` guard. The SDK is mocked, so these run with no network. They prove `unwrap` returns `data` on success, throws a code-mapped message on an API error, and throws the NO_KEY message when no key is configured.
 *
 * The Roxy client reads `ROXYAPI_KEY` once at module load, so each test resets the module registry and sets the env before importing the guard.
 */

vi.mock('@roxyapi/sdk', () => ({ createRoxy: () => ({}) }));

beforeEach(() => {
  vi.resetModules();
  process.env.ROXYAPI_KEY = 'test-key';
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('unwrap', () => {
  it('returns data on success', async () => {
    const { unwrap } = await import('@/lib/roxy/guard');
    const result = await unwrap(Promise.resolve({ data: { tithi: 'Dwitiya' }, error: undefined }));
    expect(result).toEqual({ tithi: 'Dwitiya' });
  });

  it('maps a validation_error code to a clear message', async () => {
    const { unwrap } = await import('@/lib/roxy/guard');
    await expect(
      unwrap(Promise.resolve({ data: undefined, error: { error: 'bad', code: 'validation_error' } })),
    ).rejects.toThrow(/birth date, time, and coordinates/);
  });

  it('maps a rate_limit_exceeded code to an upgrade message', async () => {
    const { unwrap } = await import('@/lib/roxy/guard');
    await expect(
      unwrap(Promise.resolve({ data: undefined, error: { error: 'slow down', code: 'rate_limit_exceeded' } })),
    ).rejects.toThrow(/quota reached/);
  });

  it('falls back to the server error string for an unknown code', async () => {
    const { unwrap } = await import('@/lib/roxy/guard');
    await expect(
      unwrap(Promise.resolve({ data: undefined, error: { error: 'teapot', code: 'unknown_code' } })),
    ).rejects.toThrow('teapot');
  });

  it('throws the NO_KEY message when the key is missing', async () => {
    process.env.ROXYAPI_KEY = '';
    const { unwrap, NO_KEY } = await import('@/lib/roxy/guard');
    await expect(unwrap(Promise.resolve({ data: {} }))).rejects.toThrow(NO_KEY);
  });
});
