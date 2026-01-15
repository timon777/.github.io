import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export type SortOption =
  | 'date_desc'
  | 'date_asc'
  | 'priority_desc'
  | 'priority_asc'
  | 'distance_asc'

interface FilterOptions {
  category?: string
  status?: string
  priority?: string
  type?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: SortOption
}

interface AdvancedFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  showPriorityFilter?: boolean
  showTypeFilter?: boolean
  showDistanceSort?: boolean
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  showPriorityFilter = false,
  showTypeFilter = false,
  showDistanceSort = false,
}: AdvancedFiltersProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      sortBy: 'date_desc',
    })
  }

  const hasActiveFilters =
    filters.category ||
    filters.status ||
    filters.priority ||
    filters.type ||
    filters.dateFrom ||
    filters.dateTo

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <span className="font-semibold text-gray-900">
            {t('filters.advancedFilters')}
          </span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full">
              {t('filters.active')}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filters Content */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('requests.category')}
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{t('categories.all')}</option>
                <option value="food">{t('categories.food')}</option>
                <option value="clothing">{t('categories.clothing')}</option>
                <option value="medicine">{t('categories.medicine')}</option>
                <option value="household">{t('categories.household')}</option>
                <option value="construction">{t('categories.construction')}</option>
                <option value="transport">{t('categories.transport')}</option>
                <option value="medical_service">{t('categories.medical_service')}</option>
                <option value="legal_service">{t('categories.legal_service')}</option>
                <option value="psychological_service">{t('categories.psychological_service')}</option>
                <option value="animal_care">{t('categories.animal_care')}</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('requests.status')}
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{t('requests.allStatuses')}</option>
                <option value="pending">{t('status.pending')}</option>
                <option value="approved">{t('status.approved')}</option>
                <option value="in_progress">{t('status.in_progress')}</option>
                <option value="completed">{t('status.completed')}</option>
                <option value="rejected">{t('status.rejected')}</option>
              </select>
            </div>

            {/* Priority Filter (optional) */}
            {showPriorityFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('requests.priority')}
                </label>
                <select
                  value={filters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">{t('requests.allPriorities')}</option>
                  <option value="urgent">{t('priority.urgent')}</option>
                  <option value="high">{t('priority.high')}</option>
                  <option value="medium">{t('priority.medium')}</option>
                  <option value="low">{t('priority.low')}</option>
                </select>
              </div>
            )}

            {/* Type Filter (for offers) */}
            {showTypeFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registry.type')}
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">{t('registry.allTypes')}</option>
                  <option value="goods">{t('registry.goods')}</option>
                  <option value="service">{t('registry.service')}</option>
                </select>
              </div>
            )}

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('filters.dateFrom')}
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('filters.dateTo')}
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('filters.sortBy')}
              </label>
              <select
                value={filters.sortBy || 'date_desc'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="date_desc">{t('filters.dateNewest')}</option>
                <option value="date_asc">{t('filters.dateOldest')}</option>
                {showPriorityFilter && (
                  <>
                    <option value="priority_desc">{t('filters.priorityHighest')}</option>
                    <option value="priority_asc">{t('filters.priorityLowest')}</option>
                  </>
                )}
                {showDistanceSort && (
                  <option value="distance_asc">{t('filters.distanceNearest')}</option>
                )}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>{t('filters.clearAll')}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
