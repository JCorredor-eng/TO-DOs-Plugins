import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { IntlProvider, addLocaleData } from 'react-intl';
import { currentLocale as initialLocale } from '../i18n-loader';

// Import locale data for date/number formatting (required by react-intl v2.x)
import esLocaleData from 'react-intl/locale-data/es';
import enLocaleData from 'react-intl/locale-data/en';

// Import translation files directly
import enTranslations from '../../translations/en-US.json';
import esTranslations from '../../translations/es-ES.json';

// Register locale data with react-intl (required for v2.x)
// This enables proper formatting of dates, numbers, and plurals for each language
addLocaleData([...esLocaleData, ...enLocaleData]);

/**
 * Supported locales in the application
 */
const SUPPORTED_LOCALES = ['en-US', 'es-ES'] as const;
type SupportedLocale = typeof SUPPORTED_LOCALES[number];

/**
 * Translation bundle structure matching the JSON files
 */
interface TranslationBundle {
  formats: {
    number: Record<string, unknown>;
    date: Record<string, unknown>;
    time: Record<string, unknown>;
    relative: Record<string, unknown>;
  };
  messages: Record<string, string>;
}

/**
 * Map of all available translations
 */
const translations: Record<SupportedLocale, TranslationBundle> = {
  'en-US': enTranslations as TranslationBundle,
  'es-ES': esTranslations as TranslationBundle,
};

/**
 * Interface for the i18n context value.
 * Provides locale state and a function to change the locale dynamically.
 */
interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  supportedLocales: readonly SupportedLocale[];
}

/**
 * Context for managing i18n locale state across the application.
 */
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

/**
 * Storage key for persisting locale preference
 */
const STORAGE_KEY = 'selectedLocale';

/**
 * Default locale (English)
 */
const DEFAULT_LOCALE: SupportedLocale = 'en-US';

/**
 * Custom hook to access the i18n context.
 * Provides the current locale and a function to change it.
 *
 * @returns The i18n context value with locale and setLocale function
 * @throws Error if used outside of CustomI18nProvider
 *
 * @example
 * const { locale, setLocale } = useI18n();
 * setLocale('es-ES');
 */
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

/**
 * Custom i18n provider that wraps react-intl's IntlProvider
 * and adds support for dynamic locale switching without page reload.
 *
 * Features:
 * - Persists locale preference to localStorage
 * - Falls back to browser language if supported
 * - Defaults to English (en-US)
 * - Loads and applies translations from JSON files
 * - Updates immediately when locale changes (no page reload)
 *
 * Supported locales:
 * - en-US (English)
 * - es-ES (Spanish)
 *
 * Technical Implementation:
 * - Uses react-intl's IntlProvider directly (not @osd/i18n wrapper)
 * - Passes locale and messages as props for dynamic updates
 * - React re-renders FormattedMessage components when locale changes
 *
 * @param props - Component props
 * @param props.children - Child components to wrap with i18n context
 */
export const CustomI18nProvider: React.FC<CustomI18nProviderProps> = ({ children }) => {
  // Initialize locale from i18n-loader (already determined at startup)
  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale as SupportedLocale);

  /**
   * Updates the locale and persists it to localStorage.
   * Changes language instantly without page reload.
   *
   * @param newLocale - The locale code to set (e.g., 'en-US', 'es-ES')
   */
  const setLocale = (newLocale: SupportedLocale) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) {
      console.warn(`[i18n] Unsupported locale: ${newLocale}. Supported: ${SUPPORTED_LOCALES.join(', ')}`);
      return;
    }

    console.log(`[i18n] Switching locale from ${locale} to ${newLocale}`);

    // Update React state - this triggers re-render
    setLocaleState(newLocale);

    // Persist to localStorage for next session
    localStorage.setItem(STORAGE_KEY, newLocale);
  };

  /**
   * Memoized context value to prevent unnecessary re-renders
   */
  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      supportedLocales: SUPPORTED_LOCALES,
    }),
    [locale]
  );

  /**
   * Get current translation bundle for the active locale
   */
  const currentTranslation = translations[locale];

  return (
    <I18nContext.Provider value={contextValue}>
      {/*
        IntlProvider from react-intl (not @osd/i18n/react wrapper).

        Key differences from previous implementation:
        - Accepts locale and messages as props (enables dynamic switching)
        - Re-renders when locale prop changes
        - No need for window.location.reload()

        The locale and messages props ensure all FormattedMessage components
        update automatically when the locale state changes.
      */}
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
