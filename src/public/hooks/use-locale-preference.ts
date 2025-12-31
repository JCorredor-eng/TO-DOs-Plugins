import { useI18n } from '../contexts';

export const useLocalePreference = () => {
  const { locale, setLocale } = useI18n();

  return { locale, setLocale };
};
