// /src/i18n/config.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import arTranslations from '../locales/ar.json';
import enTranslations from '../locales/en.json';

const resources = {
  ar: { translation: arTranslations },
  en: { translation: enTranslations }
};

// Get saved language or default to Arabic
const getSavedLanguage = () => {
  try {
    const uiStorage = localStorage.getItem('ui-storage');
    if (uiStorage) {
      const parsed = JSON.parse(uiStorage);
      return parsed.state?.language || 'ar';
    }
  } catch (error) {
    console.error('Error getting saved language:', error);
  }
  return 'ar';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(),
    fallbackLng: 'ar',
    debug: false,
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

// Update HTML attributes when language changes
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;