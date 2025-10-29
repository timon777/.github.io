import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { donorOffersService } from '../services/supabase'
import { mockDonorOffers } from '../services/mockData'
import { DonorOffer, OfferType, OfferStatus, HelpCategory } from '../types'
import VerifiedBadge from '../components/VerifiedBadge'
import { useLocationStore } from '../stores/locationStore'

type ViewMode = 'grid' | 'table'

export default function RegistryPage() {
  const { t } = useTranslation()
  const { selectedCity } = useLocationStore()
  const [selectedType, setSelectedType] = useState<OfferType | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<OfferStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('registry-view-mode') as ViewMode) || 'grid'
  })

  const { data: allOffers, isLoading } = useQuery({
    queryKey: ['donorOffers', selectedType, selectedCategory, selectedStatus],
    queryFn: async () => {
      try {
        const data = await donorOffersService.getAll({
          type: selectedType !== 'all' ? selectedType : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        })
        // Если данные есть, возвращаем их
        if (data && data.length > 0) {
          return data
        }
        // Если данных нет, возвращаем mock данные
        return mockDonorOffers
      } catch (error) {
        // При ошибке возвращаем mock данные
        if (import.meta.env.DEV) {
          console.warn('Failed to load offers from database, using mock data:', error)
        }
        return mockDonorOffers
      }
    },
  })

  // Фильтрация по городу
  const offers = useMemo(() => {
    if (!allOffers) return []
    if (!selectedCity) return allOffers

    return allOffers.filter(offer =>
      offer.location.city === selectedCity.name
    )
  }, [allOffers, selectedCity])

  // Функция переключения вида
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('registry-view-mode', mode)
  }

  // Функция маскировки телефона
  const maskPhone = (phone: string) => {
    if (!phone) return ''
    // +7 777 555 6677 -> +7 *** *** **77
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length >= 4) {
      return phone.substring(0, 3) + ' *** *** **' + phone.substring(phone.length - 2)
    }
    return phone
  }

  const getStatusColor = (status: OfferStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: OfferType) => {
    return type === 'goods' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('registry.title')}</h1>
            <p className="text-gray-600 mt-2">
              {t('registry.subtitle')}
              {selectedCity && (
                <span className="ml-2 text-primary-600 font-medium">
                  • {selectedCity.name}
                </span>
              )}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => handleViewModeChange('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Table view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('registry.type')}
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="input-field"
              >
                <option value="all">{t('registry.allTypes')}</option>
                <option value="goods">{t('registry.goods')}</option>
                <option value="service">{t('registry.service')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('registry.category')}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="input-field"
              >
                <option value="all">{t('categories.all')}</option>
                <option value="food">{t('categories.food')}</option>
                <option value="clothing">{t('categories.clothing')}</option>
                <option value="medicine">{t('categories.medicine')}</option>
                <option value="household">{t('categories.household')}</option>
                <option value="transport">{t('categories.transport')}</option>
                <option value="animal_care">{t('categories.animal_care')}</option>
                <option value="legal_service">{t('categories.legal_service')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('registry.status')}
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="input-field"
              >
                <option value="all">{t('registry.allStatuses')}</option>
                <option value="active">{t('registry.statusActive')}</option>
                <option value="reserved">{t('registry.statusReserved')}</option>
                <option value="completed">{t('registry.statusCompleted')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        {!isLoading && offers && offers.length > 0 && (
          <div className="text-sm text-gray-600 mb-4">
            {t('registry.showing')}: <span className="font-semibold">{offers.length}</span> {t('registry.offers')}
          </div>
        )}

        {/* Offers List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : offers && offers.length > 0 ? (
          viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className="card">
                <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(offer.type)}`}>
                    {offer.type === 'goods' ? t('registry.goods') : t('registry.service')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(offer.status)}`}>
                    {offer.status === 'active'
                      ? t('registry.statusActive')
                      : offer.status === 'reserved'
                      ? t('registry.statusReserved')
                      : t('registry.statusCompleted')}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2">{offer.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {offer.description}
                </p>

                {offer.quantity && offer.unit && (
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">{t('registry.quantity')}:</span> {offer.quantity} {offer.unit}
                  </div>
                )}

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {offer.location.city}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="flex items-center gap-1">
                      {offer.donor.first_name} {offer.donor.last_name}
                      <VerifiedBadge verified={offer.donor.verified || false} size="sm" />
                    </span>
                  </div>
                  {offer.contact_phone && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-500">{maskPhone(offer.contact_phone)}</span>
                    </div>
                  )}
                </div>

                {offer.expires_at && (
                  <div className="text-xs text-gray-500 mb-3">
                    {t('registry.expiresAt')}: {new Date(offer.expires_at).toLocaleDateString()}
                  </div>
                )}

                <Link
                  to={`/offers/${offer.id}`}
                  className="w-full btn-primary block text-center"
                >
                  {t('registry.viewDetails')}
                </Link>
              </div>
            ))}
          </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('registry.title')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('registry.type')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('registry.category')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('registry.city')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('registry.donor')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('registry.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('registry.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {offers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">{offer.description}</div>
                          {offer.quantity && offer.unit && (
                            <div className="text-xs text-gray-400 mt-1">
                              {offer.quantity} {offer.unit}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(offer.type)}`}>
                          {offer.type === 'goods' ? t('registry.goods') : t('registry.service')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t(`categories.${offer.category}`)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {offer.location.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          {offer.donor.first_name} {offer.donor.last_name}
                          <VerifiedBadge verified={offer.donor.verified || false} size="sm" />
                        </div>
                        {offer.contact_phone && (
                          <div className="text-xs text-gray-500">{maskPhone(offer.contact_phone)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(offer.status)}`}>
                          {offer.status === 'active'
                            ? t('registry.statusActive')
                            : offer.status === 'reserved'
                            ? t('registry.statusReserved')
                            : t('registry.statusCompleted')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/offers/${offer.id}`}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          {t('registry.viewDetails')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">{t('registry.noOffers')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
