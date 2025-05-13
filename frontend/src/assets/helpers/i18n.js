import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import locales from '../lib/index';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'kk',
    resources: locales,
    lng: 'kk',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '../lib/{{lng}}.json',
    },
  });

export default i18n;
