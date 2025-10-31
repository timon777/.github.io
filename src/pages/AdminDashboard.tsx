import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { requestsService, donorOffersService, responsesService, usersService } from '../services/supabase'
import { useEmergencyStore } from '../stores/emergencyStore'
import StatCard from '../components/StatCard'
import EmergencyToggle from '../components/EmergencyToggle'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { isEmergencyMode } = useEmergencyStore()

  // Fetch all data
  const { data: allRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ['allRequests'],
    queryFn: async () => await requestsService.getAll({}),
  })

  const { data: allOffers, isLoading: loadingOffers } = useQuery({
    queryKey: ['allOffers'],
    queryFn: async () => await donorOffersService.getAll({}),
  })

  const { data: allResponses, isLoading: loadingResponses } = useQuery({
    queryKey: ['allResponses'],
    queryFn: async () => await responsesService.getAll({}),
  })

  const { data: allUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => await usersService.getAll(),
  })

  const stats = {
    totalUsers: allUsers?.length || 0,
    totalRequests: allRequests?.length || 0,
    openRequests: allRequests?.filter((r: any) => r.status === 'open').length || 0,
    urgentRequests: allRequests?.filter((r: any) => r.priority === 'urgent').length || 0,
    totalOffers: allOffers?.length || 0,
    activeOffers: allOffers?.filter((o: any) => o.status === 'active').length || 0,
    totalResponses: allResponses?.length || 0,
    pendingResponses: allResponses?.filter((r: any) => r.status === 'pending').length || 0,
  }

  const isLoading = loadingRequests || loadingOffers || loadingResponses

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('dashboard.admin.title')}</h1>
            <p className="text-gray-600">{t('dashboard.admin.subtitle')}</p>
          </div>
          <EmergencyToggle />
        </div>

        {/* Emergency Mode Status */}
        {isEmergencyMode && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-800">{t('emergency.modeActive')}</h3>
                <p className="text-sm text-red-700">{t('emergency.priorityBoostActive')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Platform Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t('dashboard.admin.platformStats')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title={t('dashboard.admin.totalUsers')}
              value={stats.totalUsers}
              icon="👥"
              color="blue"
            />
            <StatCard
              title={t('dashboard.admin.totalRequests')}
              value={stats.totalRequests}
              icon="📋"
              color="green"
            />
            <StatCard
              title={t('dashboard.admin.totalOffers')}
              value={stats.totalOffers}
              icon="🎁"
              color="purple"
            />
            <StatCard
              title={t('dashboard.admin.totalResponses')}
              value={stats.totalResponses}
              icon="💬"
              color="yellow"
            />
          </div>
        </div>

        {/* Requests Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t('dashboard.admin.requestsStats')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title={t('dashboard.admin.openRequests')}
              value={stats.openRequests}
              icon="🔓"
              color="green"
            />
            <StatCard
              title={t('dashboard.admin.urgentRequests')}
              value={stats.urgentRequests}
              icon="🚨"
              color="red"
            />
            <StatCard
              title={t('dashboard.admin.pendingResponses')}
              value={stats.pendingResponses}
              icon="⏳"
              color="yellow"
            />
          </div>
        </div>

        {/* Admin Tools */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t('dashboard.admin.adminTools')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/verification"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-500"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                  🔒
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{t('verification.title')}</h3>
                  <p className="text-sm text-gray-600">{t('verification.adminDescription')}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              to="/admin/moderation"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-500 opacity-50 pointer-events-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
                  🛡️
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{t('moderation.title')}</h3>
                  <p className="text-sm text-gray-600">{t('common.comingSoon')}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-500 opacity-50 pointer-events-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  👥
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{t('admin.users')}</h3>
                  <p className="text-sm text-gray-600">{t('common.comingSoon')}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Requests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('dashboard.admin.recentRequests')}</h2>
              <Link to="/requests" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                {t('dashboard.viewAll')} →
              </Link>
            </div>
            {allRequests && allRequests.length > 0 ? (
              <div className="space-y-3">
                {allRequests.slice(0, 5).map((request: any) => (
                  <Link
                    key={request.id}
                    to={`/requests/${request.id}`}
                    className="block p-3 border rounded hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-sm">{request.title}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          request.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : request.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {t(`requests.${request.priority}`)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {request.beneficiary?.first_name} • {request.location?.city}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">{t('requests.noRequests')}</p>
            )}
          </div>

          {/* Recent Offers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('dashboard.admin.recentOffers')}</h2>
              <Link to="/registry" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                {t('dashboard.viewAll')} →
              </Link>
            </div>
            {allOffers && allOffers.length > 0 ? (
              <div className="space-y-3">
                {allOffers.slice(0, 5).map((offer: any) => (
                  <Link
                    key={offer.id}
                    to={`/offers/${offer.id}`}
                    className="block p-3 border rounded hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-sm">{offer.title}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          offer.type === 'goods'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {offer.type === 'goods' ? t('registry.goods') : t('registry.service')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {offer.donor?.first_name} • {offer.location?.city}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">{t('registry.noOffers')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
