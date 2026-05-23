import 'server-only';
import { cookies } from 'next/headers';
import { LANG_COOKIE, type Lang, toLang } from './lang';

/**
 * Reads the active language from the request cookie inside a Server Component or Server Action. Reading `cookies()` opts the page into dynamic rendering, which is correct here: every page re-renders when the user switches language.
 */
export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return toLang(store.get(LANG_COOKIE)?.value);
}
