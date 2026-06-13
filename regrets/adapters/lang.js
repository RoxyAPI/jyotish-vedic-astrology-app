// Adapter: Pure language validation function from src/lib/lang.ts
// Source of truth is always src/lib/lang.ts.

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'ru', label: 'Русский' },
];

const DEFAULT_LANG = 'en';

/** Narrows an arbitrary cookie string to a supported Lang, defaulting to English. */
export function toLang(value) {
  return LANGUAGES.some((l) => l.code === value) ? value : DEFAULT_LANG;
}
