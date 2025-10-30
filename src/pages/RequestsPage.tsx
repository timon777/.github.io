import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { requestsService } from '../services/supabase'
import { mockHelpRequests } from '../services/mockData'
import { HelpRequest, HelpCategory, RequestStatus, Priority } from '../types'
import { useLocationStore } from '../stores/locationStore'
import { useEmergencyStore } from '../stores/emergencyStore'
import { sortByPriority, calculatePriorityScore } from '../utils/priorityCalculator'
import { filterRequests, sortRequests, type FilterOptions } from '../utils/filterUtils'
import VerifiedBadge from '../components/VerifiedBadge'
import VulnerableCategoryBadges from '../components/VulnerableCategoryBadges'
import EmergencyToggle from '../components/EmergencyToggle'
import SearchBar from '../components/SearchBar'
import AdvancedFilters from '../components/AdvancedFilters'

type ViewMode = 'grid' | 'table'

export default function RequestsPage() {
  const { t } = useTranslation()
  const { selectedCity } = useLocationStore()
  const { isEmergencyMode } = useEmergencyStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'date_desc',
  })
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
        // Если данные есть, возвращаем их
        if (data && data.length > 0) {
          return data
        }
        // Если данных нет, возвращаем mock данные
        return mockHelpRequests
      } catch (error) {
        // При ошибке возвращаем mock данные
        if (import.meta.env.DEV) {
          console.warn('Failed to load requests from database, using mock data:', error)
        }
        return mockHelpRequests
      }
    },
  })

  // Фильтрация, поиск и сортировка
  const requests = useMemo(() => {
    if (!allRequests) return []

    // Фильтруем по городу
    let filtered = allRequests
    if (selectedCity) {
      filtered = filtered.filter(request =>
        request.location.city === selectedCity.name
      )
    }

    // Применяем поиск и продвинутые фильтры
    filtered = filterRequests(filtered, searchQuery, filters)

    // Сортировка
    if (filters.sortBy) {
      if (filters.sortBy.includes('priority')) {
        // Если сортируем по приоритету, используем специальную функцию с учетом экстренного режима
        filtered = sortByPriority(filtered, isEmergencyMode)
        if (filters.sortBy === 'priority_asc') {
          filtered = filtered.reverse()
        }
      } else {
        filtered = sortRequests(filtered, filters.sortBy)
      }
    } else {
      // По умолчанию - по приоритету
      filtered = sortByPriority(filtered, isEmergencyMode)
    }

    return filtered
  }, [allRequests, selectedCity, isEmergencyMode, searchQuery, filters])

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
            {/* Emergency Mode Toggle (admin only) */}
            <EmergencyToggle />

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

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('filters.searchPlaceholder')}
          />
        </div>

        {/* Advanced Filters */}
        <div className="mb-8">
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            showPriorityFilter={true}
            showDistanceSort={false}
          />
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

                  {/* Vulnerable Category Badges */}
                  {(request.vulnerable_categories?.length || request.has_children || request.has_elderly || request.has_disabled) && (
                    <div className="mb-3">
                      <VulnerableCategoryBadges
                        categories={request.vulnerable_categories}
                        hasChildren={request.has_children}
                        hasElderly={request.has_elderly}
                        hasDisabled={request.has_disabled}
                      />
                    </div>
                  )}

                  {/* Priority Score */}
                  {isEmergencyMode && (
                    <div className="mb-3 text-xs text-gray-600">
                      {t('emergency.priorityScore')}: <span className="font-bold text-primary-600">{calculatePriorityScore(request, isEmergencyMode)}</span>
                    </div>
                  )}

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
                      {t('vulnerable.categories')}
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status === 'open' ? t('requests.open') : request.status === 'in_progress' ? t('requests.inProgress') : t('requests.closed')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <VulnerableCategoryBadges
                          categories={request.vulnerable_categories}
                          hasChildren={request.has_children}
                          hasElderly={request.has_elderly}
                          hasDisabled={request.has_disabled}
                        />
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
