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

  return (
    <div className="flex items-center space-x-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            i18n.language === lang.code
              ? 'bg-sky-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={lang.name}
        >
          {lang.name}
        </button>
      ))}
    </div>
  )
}
