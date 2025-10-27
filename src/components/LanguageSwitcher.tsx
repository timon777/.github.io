import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'ru', name: 'РУС' },
  { code: 'kk', name: 'ҚАЗ' },
  { code: 'en', name: 'ENG' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  // Показываем только неактивные языки
  const availableLanguages = languages.filter(lang => lang.code !== i18n.language)

  return (
    <div className="flex items-center space-x-2">
      {availableLanguages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          title={lang.name}
        >
          {lang.name}
        </button>
      ))}
    </div>
  )
}
