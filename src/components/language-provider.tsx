'use client';

import { createContext, useContext, useState, useEffect } from 'react';

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

type LangCode = (typeof LANGUAGES)[number]['code'];

const LanguageContext = createContext<{
  lang: LangCode;
  setLang: (lang: LangCode) => void;
}>({ lang: 'en', setLang: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('en');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as LangCode | null;
    if (stored && LANGUAGES.some((l) => l.code === stored)) {
      setLangState(stored);
    }
  }, []);

  function setLang(code: LangCode) {
    setLangState(code);
    localStorage.setItem('lang', code);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
