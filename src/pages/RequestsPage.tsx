import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { requestsService, enhanceRequestsWithPriority } from '../services/supabase'
import { mockHelpRequests } from '../services/mockData'
import { HelpCategory, RequestStatus, Priority } from '../types'
import { useLocationStore } from '../stores/locationStore'
import VerifiedBadge from '../components/VerifiedBadge'
import { useEmergencyStore } from '../stores/emergencyStore'

type ViewMode = 'grid' | 'table'

export default function RequestsPage() {
  const { t } = useTranslation()
  const { selectedCity } = useLocationStore()
  const { isEmergency, lastActivatedAt } = useEmergencyStore()
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | 'all'>('all')
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('requests-view-mode') as ViewMode) || 'grid'
  })

  const { data: allRequests, isLoading } = useQuery({
    queryKey: ['helpRequests', selectedCategory, selectedStatus, selectedPriority],
    queryFn: async () => {
      try {
        const data = await requestsService.getAll({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          priority: selectedPriority !== 'all' ? selectedPriority : undefined,
        })
        if (data && data.length > 0) {
          return data
        }
        return enhanceRequestsWithPriority(mockHelpRequests)
      } catch (error) {
        // При ошибке возвращаем mock данные
        if (import.meta.env.DEV) {
          console.warn('Failed to load requests from database, using mock data:', error)
        }
        return enhanceRequestsWithPriority(mockHelpRequests)
      }
    },
  })

  const prioritizedRequests = useMemo(() => {
    if (!allRequests) return []
    return enhanceRequestsWithPriority(allRequests)
  }, [allRequests, isEmergency])

  // Фильтрация по городу
  const requests = useMemo(() => {
    if (!prioritizedRequests) return []
    if (!selectedCity) return prioritizedRequests

    return prioritizedRequests.filter(request =>
      request.location.city === selectedCity.name
    )
  }, [prioritizedRequests, selectedCity])

  // Функция переключения вида
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('requests-view-mode', mode)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t('requests.title')}</h1>
            <p className="text-gray-600 mt-1">
              {t('registry.showing')} {requests?.length || 0} {t('requests.requests')}
              {selectedCity && <span className="text-primary-600 font-semibold"> • {selectedCity.name}</span>}
            </p>
          </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white rounded-lg shadow-sm border p-1">
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

            <Link to="/create-request" className="btn-primary whitespace-nowrap">
              {t('requests.createNew')}
            </Link>
          </div>
        </div>

        {isEmergency && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.66 1.73-3L13.73 4c-.77-1.34-2.69-1.34-3.46 0L3.34 16c-.77 1.34.19 3 1.73 3z" />
              </svg>
              <div>
                <p className="font-semibold">{t('emergency.badge')}</p>
                <p className="text-sm mt-1">{t('emergency.description')}</p>
                {lastActivatedAt && (
                  <p className="text-xs text-red-600 mt-2">
                    {t('emergency.activatedAt', { date: new Date(lastActivatedAt).toLocaleString() })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="medical_service">{t('categories.medical_service')}</option>
                <option value="legal_service">{t('categories.legal_service')}</option>
                <option value="psychological_service">{t('categories.psychological_service')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('requests.priority')}
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as any)}
                className="input-field"
              >
                <option value="all">{t('requests.allPriorities')}</option>
                <option value="urgent">{t('requests.urgent')}</option>
                <option value="high">{t('requests.high')}</option>
                <option value="medium">{t('requests.medium')}</option>
                <option value="low">{t('requests.low')}</option>
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
                <option value="all">{t('requests.allStatuses')}</option>
                <option value="open">{t('requests.open')}</option>
                <option value="in_progress">{t('requests.inProgress')}</option>
                <option value="closed">{t('requests.closed')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : requests && requests.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <div key={request.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(request.priority)}`}>
                      {t(`requests.${request.priority}`)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                      {request.status === 'open' ? t('requests.open') : request.status === 'in_progress' ? t('requests.inProgress') : t('requests.closed')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-2">{request.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {request.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {request.location.city}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {request.beneficiary.first_name} {request.beneficiary.last_name}
                      {request.beneficiary.verified && <VerifiedBadge verified={true} size="sm" className="ml-1" />}
                    </div>
                    {typeof request.computed_priority === 'number' && (
                      <div className="flex items-center text-xs text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.567-3 3.5S10.343 15 12 15s3-1.567 3-3.5S13.657 8 12 8zm0 0V5m0 13v-3m5.657-9.657L18 7m-12-2 1.343 1.343M19 12h2m-18 0h2" />
                        </svg>
                        {t('requests.priorityScore', { score: request.computed_priority })}
                      </div>
                    )}
                  </div>

                  <Link to={`/requests/${request.id}`} className="w-full btn-primary block text-center">
                    {t('requests.viewDetails')}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('requests.title')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('registry.category')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('requests.priority')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('registry.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('registry.city')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('requests.beneficiary')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('registry.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{request.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{request.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{t(`categories.${request.category}`)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                          {t(`requests.${request.priority}`)}
                        </span>
                        {typeof request.computed_priority === 'number' && (
                          <div className="text-xs text-gray-500 mt-1">
                            {t('requests.priorityScore', { score: request.computed_priority })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status === 'open' ? t('requests.open') : request.status === 'in_progress' ? t('requests.inProgress') : t('requests.closed')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.location.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900">
                            {request.beneficiary.first_name} {request.beneficiary.last_name}
                          </span>
                          {request.beneficiary.verified && <VerifiedBadge verified={true} size="sm" className="ml-1" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/requests/${request.id}`}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          {t('requests.viewDetails')}
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
            <p className="text-gray-600">{t('requests.noRequests')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
