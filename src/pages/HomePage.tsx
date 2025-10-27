import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl mb-8 text-primary-50">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/requests" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                {t('home.hero.viewRequests')}
              </Link>
              <Link to="/create-request" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                {t('home.hero.askHelp')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.features.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('home.features.transparency.title')}</h3>
              <p className="text-gray-600">
                {t('home.features.transparency.description')}
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('home.features.ecosystem.title')}</h3>
              <p className="text-gray-600">
                {t('home.features.ecosystem.description')}
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('home.features.noMoney.title')}</h3>
              <p className="text-gray-600">
                {t('home.features.noMoney.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.helpCategories.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: t('categories.food'), icon: '🍞', key: 'food' },
              { name: t('categories.clothing'), icon: '👕', key: 'clothing' },
              { name: t('categories.medicine'), icon: '💊', key: 'medicine' },
              { name: t('categories.household'), icon: '🏠', key: 'household' },
              { name: t('home.helpCategories.services'), icon: '🤝', key: 'services' },
              { name: t('categories.animal_care'), icon: '🐾', key: 'animal_care' },
            ].map((category) => (
              <Link
                key={category.key}
                to={`/requests?category=${category.key}`}
                className="card text-center hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <p className="font-semibold">{category.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">1,234</div>
              <div className="text-gray-600">{t('home.stats.helpRequests')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary-600 mb-2">567</div>
              <div className="text-gray-600">{t('home.stats.activeVolunteers')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">89</div>
              <div className="text-gray-600">{t('home.stats.shelters')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">2,345</div>
              <div className="text-gray-600">{t('home.stats.helpProvided')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('home.cta.title')}</h2>
          <p className="text-xl mb-8 text-primary-50">
            {t('home.cta.subtitle')}
          </p>
          <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-block">
            {t('home.cta.register')}
          </Link>
        </div>
      </section>
    </div>
  )
}
