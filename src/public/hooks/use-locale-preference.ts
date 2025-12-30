import { useI18n } from '../contexts';

/**
 * Hook to access the current locale preference.
 *
 * This hook provides access to the locale managed by the CustomI18nProvider.
 * It's a convenience wrapper around the useI18n context hook.
 *
 * Priority order for locale selection:
 * 1. Saved preference in localStorage
 * 2. Browser language (if supported)
 * 3. English (en-US) by default
 *
 * @returns Object containing the current locale and a function to change it
 *
 * @example
 * const { locale, setLocale } = useLocalePreference();
 * console.log(locale); // 'en-US' or 'es-ES'
 * setLocale('es-ES'); // Switch to Spanish
 */
export const useLocalePreference = () => {
  const { locale, setLocale } = useI18n();

  return { locale, setLocale };
};
