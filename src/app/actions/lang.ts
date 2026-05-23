'use server';

import { cookies } from 'next/headers';
import { LANG_COOKIE, type Lang } from '@/lib/lang';

/**
 * Persists the chosen language in a cookie. The client switcher calls this then `router.refresh()`, which re-renders the Server Components so every interpretation re-fetches in the new language.
 */
export async function setLang(lang: Lang): Promise<void> {
  const store = await cookies();
  store.set(LANG_COOKIE, lang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}
