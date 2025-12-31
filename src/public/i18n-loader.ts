

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
