import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { donorOffersService, responsesService } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'
import StatCard from '../components/StatCard'

export default function DonorDashboard() {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  // Fetch user's offers
  const { data: myOffers, isLoading: loadingOffers } = useQuery({
    queryKey: ['myOffers', user?.id],
    queryFn: async () => {
      if (!user) return []
      const allOffers = await donorOffersService.getAll({})
      return allOffers.filter((o: any) => o.donor_id === user.id)
    },
    enabled: !!user,
  })

  // Fetch user's responses
  const { data: myResponses, isLoading: loadingResponses } = useQuery({
    queryKey: ['myDonorResponses', user?.id],
    queryFn: async () => {
      if (!user) return []
      return await responsesService.getAll({ donor_id: user.id })
    },
    enabled: !!user,
  })

  const stats = {
    totalOffers: myOffers?.length || 0,
    activeOffers: myOffers?.filter((o: any) => o.status === 'active').length || 0,
    totalResponses: myResponses?.length || 0,
    acceptedResponses: myResponses?.filter((r: any) => r.status === 'accepted').length || 0,
  }

  if (loadingOffers) {
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
          <h1 className="text-3xl font-bold mb-2">{t('dashboard.donor.title')}</h1>
          <p className="text-gray-600">{t('dashboard.donor.subtitle')}</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('dashboard.donor.totalOffers')}
            value={stats.totalOffers}
            icon="🎁"
            color="blue"
          />
          <StatCard
            title={t('dashboard.donor.activeOffers')}
            value={stats.activeOffers}
            icon="✨"
            color="green"
          />
          <StatCard
            title={t('dashboard.donor.totalResponses')}
            value={stats.totalResponses}
            icon="💬"
            color="yellow"
          />
          <StatCard
            title={t('dashboard.donor.acceptedResponses')}
            value={stats.acceptedResponses}
            icon="✓"
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{t('dashboard.quickActions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/create-offer" className="btn-primary text-center">
              + {t('registry.createNew')}
            </Link>
            <Link to="/registry" className="btn-secondary text-center">
              {t('dashboard.donor.viewAllOffers')}
            </Link>
            <Link to="/requests" className="btn-secondary text-center">
              {t('dashboard.donor.browseRequests')}
            </Link>
          </div>
        </div>

        {/* My Offers */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{t('dashboard.donor.myOffers')}</h2>
            <Link to="/registry" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              {t('dashboard.viewAll')} →
            </Link>
          </div>

          {myOffers && myOffers.length > 0 ? (
            <div className="space-y-4">
              {myOffers.slice(0, 5).map((offer: any) => (
                <Link
                  key={offer.id}
                  to={`/offers/${offer.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{offer.title}</h3>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          offer.type === 'goods'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {offer.type === 'goods' ? t('registry.goods') : t('registry.service')}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          offer.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : offer.status === 'reserved'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {offer.status === 'active'
                          ? t('registry.active')
                          : offer.status === 'reserved'
                          ? t('registry.reserved')
                          : t('registry.completed')}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{offer.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📍 {offer.location?.city}</span>
                    <span>📅 {new Date(offer.created_at).toLocaleDateString()}</span>
                    {offer.expires_at && (
                      <span>⏰ {t('registry.expires')}: {new Date(offer.expires_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">{t('dashboard.donor.noOffers')}</p>
              <Link to="/create-offer" className="btn-primary">
                {t('registry.createNew')}
              </Link>
            </div>
          )}
        </div>

        {/* My Responses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">{t('dashboard.donor.myResponses')}</h2>

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
                      <h3 className="font-semibold">{response.request?.title}</h3>
                      <p className="text-sm text-gray-600">
                        {t('dashboard.donor.requestFrom')}: {response.request?.beneficiary?.first_name} {response.request?.beneficiary?.last_name}
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
                    {t('dashboard.donor.viewRequest')} →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">{t('dashboard.donor.noResponses')}</p>
              <Link to="/requests" className="btn-primary">
                {t('dashboard.donor.browseRequests')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
