import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getLanguageFromCountry } from '@/utils/geolocation';

// Import translation files
import ltTranslations from './locales/lt.json';
import enTranslations from './locales/en.json';

const resources = {
  lt: {
    translation: ltTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

// Custom geographic language detector
const geoDetector = {
  name: 'geoDetector',
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const geoLanguage = await getLanguageFromCountry();
      callback(geoLanguage);
    } catch (error) {
      console.warn('Geographic language detection failed, falling back to navigator language');
      callback('lt'); // fallback to Lithuanian
    }
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'lt',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['querystring', 'localStorage', 'geoDetector', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

// Add custom detector after initialization
i18n.services.languageDetector.addDetector(geoDetector);

export default i18n;