import 'server-only';
import { createRoxy } from '@roxyapi/sdk';

/**
 * Server-only Roxy SDK client. One key unlocks every domain in the catalog, so there is no base URL to configure and no generated schema to keep in sync: `createRoxy` sets the base URL and injects the auth header on every request.
 *
 * @remarks The `server-only` import makes any accidental client-side import a build error, so the secret key can never reach the browser. Read {@link hasApiKey} before calling, or wrap the call in `unwrap` from `./guard`.
 */
const key = process.env.ROXYAPI_KEY;

export const roxy = createRoxy(key ?? '');

/** True when `ROXYAPI_KEY` is set. Render `ApiKeyMissing` at the page boundary when this is false instead of letting calls fail. */
export const hasApiKey = Boolean(key);
