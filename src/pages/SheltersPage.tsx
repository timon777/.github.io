import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Shelter } from '../types'

export default function SheltersPage() {
  const { t } = useTranslation()

  // Mock data for demonstration
  const mockShelters: Shelter[] = [
    {
      id: '1',
      name: 'Приют "Верные друзья"',
      description: 'Приют для бездомных собак и кошек. Нуждаемся в кормах, медикаментах и стройматериалах.',
      type: 'animal',
      location: {
        id: '1',
        address: 'ул. Рыскулова 45',
        city: 'Алматы',
        region: 'Алматы',
        country: 'Казахстан',
        latitude: 43.2380,
        longitude: 76.9450,
      },
      contact_email: 'shelter1@example.com',
      contact_phone: '+7 (777) 123-45-67',
      verified: true,
      rating: 4.8,
      manager: {
        id: '1',
        email: 'manager@example.com',
        first_name: 'Айгуль',
        last_name: 'Сарсенова',
        role: 'shelter',
        verified: true,
        created_at: '2024-01-01',
      },
      created_at: '2024-01-01',
    },
    {
      id: '2',
      name: 'Дом престарелых "Забота"',
      description: 'Центр для пожилых людей. Нуждаемся в продуктах, медикаментах и волонтерской помощи.',
      type: 'human',
      location: {
        id: '2',
        address: 'пр. Суюнбая 123',
        city: 'Алматы',
        region: 'Алматы',
        country: 'Казахстан',
        latitude: 43.2500,
        longitude: 76.9300,
      },
      contact_email: 'shelter2@example.com',
      contact_phone: '+7 (777) 234-56-78',
      verified: true,
      rating: 4.9,
      manager: {
        id: '2',
        email: 'manager2@example.com',
        first_name: 'Нурлан',
        last_name: 'Каримов',
        role: 'shelter',
        verified: true,
        created_at: '2024-02-01',
      },
      created_at: '2024-02-01',
    },
  ]

  const { data: shelters, isLoading } = useQuery({
    queryKey: ['shelters'],
    queryFn: () => mockShelters, // Replace with: sheltersService.getAll()
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('shelters.pageTitle')}</h1>
          <p className="text-gray-600">
            {t('shelters.pageSubtitle')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🐾</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600">45</div>
                <div className="text-sm text-gray-600">{t('shelters.animalShelters')}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary-600">23</div>
                <div className="text-sm text-gray-600">{t('shelters.socialCenters')}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">68</div>
                <div className="text-sm text-gray-600">{t('shelters.verified')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Shelters List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : shelters && shelters.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {shelters.map((shelter) => (
              <div key={shelter.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-2xl">{shelter.type === 'animal' ? '🐾' : '❤️'}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{shelter.name}</h3>
                      {shelter.verified && (
                        <span className="inline-flex items-center text-xs text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {t('common.verified')}
                        </span>
                      )}
                    </div>
                  </div>
                  {shelter.rating && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1 text-sm font-semibold">{shelter.rating}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mb-4">{shelter.description}</p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {shelter.location.address}, {shelter.location.city}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {shelter.contact_email}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {shelter.contact_phone}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 btn-primary">
                    {t('shelters.helpShelter')}
                  </button>
                  <button className="flex-1 btn-outline">
                    {t('shelters.details')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">{t('shelters.noShelters')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
