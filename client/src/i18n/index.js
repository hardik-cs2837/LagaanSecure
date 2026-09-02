import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';
import mr from './mr.json';
import pa from './pa.json';
import gu from './gu.json';
import te from './te.json';
import ta from './ta.json';
import kn from './kn.json';
import bn from './bn.json';

const savedLanguage = localStorage.getItem('language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
      pa: { translation: pa },
      gu: { translation: gu },
      te: { translation: te },
      ta: { translation: ta },
      kn: { translation: kn },
      bn: { translation: bn }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
