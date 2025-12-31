import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { IntlProvider, addLocaleData } from 'react-intl';
import { currentLocale as initialLocale } from '../i18n-loader';

import esLocaleData from 'react-intl/locale-data/es';
import enLocaleData from 'react-intl/locale-data/en';

import enTranslations from '../../translations/en-US.json';
import esTranslations from '../../translations/es-ES.json';

addLocaleData([...esLocaleData, ...enLocaleData]);

const SUPPORTED_LOCALES = ['en-US', 'es-ES'] as const;
type SupportedLocale = typeof SUPPORTED_LOCALES[number];

interface TranslationBundle {
  formats: {
    number: Record<string, unknown>;
    date: Record<string, unknown>;
    time: Record<string, unknown>;
    relative: Record<string, unknown>;
  };
  messages: Record<string, string>;
}

const translations: Record<SupportedLocale, TranslationBundle> = {
  'en-US': enTranslations as TranslationBundle,
  'es-ES': esTranslations as TranslationBundle,
};

interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  supportedLocales: readonly SupportedLocale[];
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = 'selectedLocale';

const DEFAULT_LOCALE: SupportedLocale = 'en-US';

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within CustomI18nProvider');
  }
  return context;
};

interface CustomI18nProviderProps {
  children: ReactNode;
}

export const CustomI18nProvider: React.FC<CustomI18nProviderProps> = ({ children }) => {

  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale as SupportedLocale);

  const setLocale = (newLocale: SupportedLocale) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) {
      console.warn(`[i18n] Unsupported locale: ${newLocale}. Supported: ${SUPPORTED_LOCALES.join(', ')}`);
      return;
    }

    console.log(`[i18n] Switching locale from ${locale} to ${newLocale}`);

    setLocaleState(newLocale);

    localStorage.setItem(STORAGE_KEY, newLocale);
  };

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      supportedLocales: SUPPORTED_LOCALES,
    }),
    [locale]
  );

  const currentTranslation = translations[locale];

  return (
    <I18nContext.Provider value={contextValue}>
      <IntlProvider
        locale={locale}
        messages={currentTranslation.messages}
        defaultLocale={DEFAULT_LOCALE}
        textComponent={React.Fragment}
      >
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  );
};
