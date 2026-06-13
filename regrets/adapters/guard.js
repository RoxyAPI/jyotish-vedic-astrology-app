// Adapter: Error code mapping from src/lib/roxy/guard.ts
// Source of truth is always src/lib/roxy/guard.ts.

const NO_KEY =
  'ROXYAPI_KEY is not set. Add it to .env.local and restart the dev server. Get a key at roxyapi.com/pricing.';

/** Maps the stable error.code from the SDK error table to a user-facing message. */
export function messageForCode(code, fallback) {
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
