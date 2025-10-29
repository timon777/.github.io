import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { requestsService, responsesService } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'
import StatCard from '../components/StatCard'

export default function BeneficiaryDashboard() {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  // Fetch user's requests
  const { data: myRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ['myRequests', user?.id],
    queryFn: async () => {
      if (!user) return []
      const allRequests = await requestsService.getAll({})
      return allRequests.filter((r: any) => r.beneficiary_id === user.id)
    },
    enabled: !!user,
  })

  // Fetch responses to user's requests
  const { data: myResponses, isLoading: loadingResponses } = useQuery({
    queryKey: ['myResponses', user?.id],
    queryFn: async () => {
      if (!user || !myRequests) return []
      const allResponses = []
      for (const request of myRequests) {
        const responses = await responsesService.getAll({ request_id: request.id })
        allResponses.push(...responses)
      }
      return allResponses
    },
    enabled: !!user && !!myRequests && myRequests.length > 0,
  })

  const stats = {
    totalRequests: myRequests?.length || 0,
    openRequests: myRequests?.filter((r: any) => r.status === 'open').length || 0,
    inProgressRequests: myRequests?.filter((r: any) => r.status === 'in_progress').length || 0,
    pendingResponses: myResponses?.filter((r: any) => r.status === 'pending').length || 0,
    acceptedResponses: myResponses?.filter((r: any) => r.status === 'accepted').length || 0,
  }

  if (loadingRequests) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('dashboard.beneficiary.title')}</h1>
          <p className="text-gray-600">{t('dashboard.beneficiary.subtitle')}</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('dashboard.beneficiary.totalRequests')}
            value={stats.totalRequests}
            icon="📋"
            color="blue"
          />
          <StatCard
            title={t('dashboard.beneficiary.openRequests')}
            value={stats.openRequests}
            icon="🔓"
            color="green"
          />
          <StatCard
            title={t('dashboard.beneficiary.pendingResponses')}
            value={stats.pendingResponses}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title={t('dashboard.beneficiary.acceptedResponses')}
            value={stats.acceptedResponses}
            icon="✓"
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{t('dashboard.quickActions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/create-request" className="btn-primary text-center">
              + {t('requests.createNew')}
            </Link>
            <Link to="/requests" className="btn-secondary text-center">
              {t('dashboard.beneficiary.viewAllRequests')}
            </Link>
          </div>
        </div>

        {/* My Requests */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{t('dashboard.beneficiary.myRequests')}</h2>
            <Link to="/requests" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              {t('dashboard.viewAll')} →
            </Link>
          </div>

          {myRequests && myRequests.length > 0 ? (
            <div className="space-y-4">
              {myRequests.slice(0, 5).map((request: any) => (
                <Link
                  key={request.id}
                  to={`/requests/${request.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{request.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        request.status === 'open'
                          ? 'bg-green-100 text-green-800'
                          : request.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {request.status === 'open'
                        ? t('requests.open')
                        : request.status === 'in_progress'
                        ? t('requests.inProgress')
                        : t('requests.closed')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{request.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📍 {request.location?.city}</span>
                    <span>📅 {new Date(request.created_at).toLocaleDateString()}</span>
                    {request.priority && (
                      <span
                        className={`px-2 py-0.5 rounded ${
                          request.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : request.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {t(`requests.${request.priority}`)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">{t('dashboard.beneficiary.noRequests')}</p>
              <Link to="/create-request" className="btn-primary">
                {t('requests.createNew')}
              </Link>
            </div>
          )}
        </div>

        {/* Recent Responses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">{t('dashboard.beneficiary.recentResponses')}</h2>

          {loadingResponses ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : myResponses && myResponses.length > 0 ? (
            <div className="space-y-4">
              {myResponses.slice(0, 5).map((response: any) => (
                <div key={response.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">
                        {response.donor?.first_name} {response.donor?.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t('dashboard.beneficiary.respondedTo')}: {response.request?.title}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        response.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : response.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {t(`responses.status_${response.status}`)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{response.message}</p>
                  <Link
                    to={`/requests/${response.request_id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {t('dashboard.beneficiary.viewRequest')} →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>{t('dashboard.beneficiary.noResponses')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
