/**
 * Cookie-driven i18n. The language is stored in a single cookie; Server Components read it and forward it to the SDK as `query: { lang }`. The client language switcher writes the cookie through a Server Action and calls `router.refresh()`, so every interpretation re-fetches in the chosen language with no client provider and no per-page state.
 *
 * @remarks Supported codes mirror the eight RoxyAPI response languages. English is the source of truth and the fallback for any untranslated field.
 */

export const LANG_COOKIE = 'lang';

/** The eight response languages RoxyAPI accepts on the `lang` query of i18n-aware endpoints. */
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'ru', label: 'Русский' },
] as const;

export type Lang = (typeof LANGUAGES)[number]['code'];

export const DEFAULT_LANG: Lang = 'en';

/** Narrows an arbitrary cookie string to a supported {@link Lang}, defaulting to English. */
export function toLang(value: string | undefined): Lang {
  return LANGUAGES.some((l) => l.code === value) ? (value as Lang) : DEFAULT_LANG;
}
