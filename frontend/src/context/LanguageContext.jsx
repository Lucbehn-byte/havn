import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS, getTranslation } from '../utils/i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem('havn_language');
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
        return stored;
      }
      // Automatischer Browser-Spracherkennungs-Fallback
      if (typeof navigator !== 'undefined' && navigator.language) {
        const browserCode = navigator.language.slice(0, 2).toLowerCase();
        if (SUPPORTED_LANGUAGES.some((l) => l.code === browserCode)) {
          return browserCode;
        }
      }
    } catch {
      // Fallback
    }
    return 'de';
  });

  const setLanguage = useCallback((code) => {
    if (SUPPORTED_LANGUAGES.some((l) => l.code === code)) {
      setLanguageState(code);
      try {
        localStorage.setItem('havn_language', code);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, []);

  const currentLanguage = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const t = useCallback((key, fallback = '') => {
    return getTranslation(language, key, fallback);
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    currentLanguage,
    languages: SUPPORTED_LANGUAGES,
    t,
  }), [language, setLanguage, currentLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
