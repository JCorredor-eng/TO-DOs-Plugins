/**
 * i18n loader - Determines the locale preference before the application starts
 *
 * This module must be imported at the very beginning of the application
 * to determine which locale to use based on user preferences.
 *
 * Note: We don't pre-register translations here because some messages contain
 * variables (like {max}, {count}, {title}) that need to be provided at render time.
 * The @osd/i18n system will automatically use the correct translations when
 * components call i18n.translate() or use <FormattedMessage>.
 */

// Get the locale from localStorage
const savedLocale = localStorage.getItem('selectedLocale');
const browserLocale = navigator.language;
const supportedLocales = ['en-US', 'es-ES'];

let currentLocale = 'en-US';
if (savedLocale && supportedLocales.includes(savedLocale)) {
  currentLocale = savedLocale;
} else if (browserLocale && supportedLocales.includes(browserLocale)) {
  currentLocale = browserLocale;
}

console.log(`[i18n] Using locale: ${currentLocale}`);

export { currentLocale };
