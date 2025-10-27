import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'ru', name: 'РУС', flag: '🇷🇺' },
  { code: 'kk', name: 'ҚАЗ', flag: '🇰🇿' },
  { code: 'en', name: 'ENG', flag: '🇬🇧' },
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
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            i18n.language === lang.code
              ? 'bg-sky-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={lang.name}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.name}
        </button>
      ))}
    </div>
  )
}
