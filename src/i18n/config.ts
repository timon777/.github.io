import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ru from './locales/ru.json'
import kk from './locales/kk.json'

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  kk: { translation: kk },
}

// Get saved language or default to Russian
const savedLanguage = localStorage.getItem('language') || 'ru'

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  })

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng)
})

export default i18n
