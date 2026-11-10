import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { TRANSLATIONS, type Language, type TranslationDictionary } from './translations';
import { getLocalizedTopic } from './topicTranslations';
import type { FullTopicData } from '../data/topicLoader';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof TranslationDictionary) => string;
  getTopic: (topic: FullTopicData) => FullTopicData;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'ella_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'hi') {
        return stored;
      }
    } catch {}
    return 'hi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  const t = (key: keyof TranslationDictionary): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || String(key);
  };

  const getTopic = (topic: FullTopicData): FullTopicData => {
    return getLocalizedTopic(topic, language);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      getTopic,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
