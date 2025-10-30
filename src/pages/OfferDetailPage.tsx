import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { donorOffersService, requestsService, messagesService } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'
import { useRoleAccess } from '../hooks/useRoleAccess'
import VerifiedBadge from '../components/VerifiedBadge'
import VulnerableCategoryBadges from '../components/VulnerableCategoryBadges'
import { findMatchingRequests, getMatchQuality } from '../utils/matchingSystem'

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { canCreateRequests } = useRoleAccess()

  const { data: offer, isLoading } = useQuery({
    queryKey: ['donorOffer', id],
    queryFn: async () => {
      if (!id) throw new Error('No offer ID')
      const data = await donorOffersService.getById(id)
      return data
    },
    enabled: !!id,
  })

  // Fetch all help requests for matching
  const { data: allRequests = [] } = useQuery({
    queryKey: ['helpRequests'],
    queryFn: () => requestsService.getAll(),
  })

  // Calculate matching requests
  const matchingRequests = useMemo(() => {
    if (!offer || !allRequests || allRequests.length === 0) return []
    return findMatchingRequests(offer, allRequests, 5)
  }, [offer, allRequests])

  const isOwner = user && offer && user.id === offer.donor_id

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('registry.active')
      case 'reserved':
        return t('registry.reserved')
      case 'completed':
        return t('registry.completed')
      default:
        return status
    }
  }

  const handleDelete = async () => {
    if (!offer || !window.confirm(t('registry.confirmDelete'))) return

    try {
      await donorOffersService.delete(offer.id)
      navigate('/registry')
    } catch (error) {
      console.error('Ошибка при удалении:', error)
      alert(t('common.error'))
    }
  }

  const handleStartChat = async () => {
    if (!user || !offer) return

    try {
      // Create or get existing chat
      await messagesService.getOrCreateChat(
        user.id,
        offer.donor_id,
        { offerId: offer.id }
      )

      // Navigate to messages page
      navigate('/messages')
    } catch (error) {
      console.error('Error starting chat:', error)
      alert(t('common.error'))
    }
  }

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

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('registry.notFound')}</h1>
          <Link to="/registry" className="btn-primary">
            {t('registry.backToRegistry')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-gray-600">
          <Link to="/" className="hover:text-primary-600">{t('nav.home')}</Link>
          <span className="mx-2">/</span>
          <Link to="/registry" className="hover:text-primary-600">{t('nav.registry')}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{offer.title}</span>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3">{offer.title}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(offer.status)}`}>
                    {getStatusLabel(offer.status)}
                  </span>
                  <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    {offer.type === 'goods' ? t('registry.goods') : t('registry.service')}
                  </span>
                  <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                    {t(`categories.${offer.category}`)}
                  </span>
                </div>
              </div>

              {isOwner && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/offers/${offer.id}/edit`)}
                    className="btn-secondary"
                  >
                    {t('common.edit')}
                  </button>
                  <button onClick={handleDelete} className="btn-secondary text-red-600 hover:bg-red-50">
                    {t('common.delete')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">{t('registry.description')}</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{offer.description}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {offer.type === 'goods' && offer.quantity && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('registry.quantity')}</h3>
                  <p className="text-lg font-semibold">
                    {offer.quantity} {offer.unit || t('registry.pcs')}
                  </p>
                </div>
              )}

              {offer.expires_at && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('registry.expiresAt')}</h3>
                  <p className="text-lg font-semibold">
                    {new Date(offer.expires_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('registry.city')}</h3>
                <p className="text-lg font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {offer.location.city}
                </p>
              </div>

              {offer.address && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('registry.address')}</h3>
                  <p className="text-lg">{offer.address}</p>
                </div>
              )}
            </div>

            {/* Donor Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">{t('registry.donor')}</h2>
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-primary-600">
                      {offer.donor?.first_name?.[0] || 'D'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold mr-2">
                        {offer.donor?.first_name} {offer.donor?.last_name}
                      </h3>
                      {offer.donor?.verified && <VerifiedBadge verified={true} />}
                    </div>
                    <p className="text-gray-600 mb-3">
                      {t('registry.donor')}
                    </p>

                    {/* Contact Info */}
                    {(offer.contact_phone || offer.contact_email) && (
                      <div className="space-y-2">
                        {offer.contact_phone && (
                          <div className="flex items-center text-gray-700">
                            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a href={`tel:${offer.contact_phone}`} className="hover:text-primary-600">
                              {offer.contact_phone}
                            </a>
                          </div>
                        )}
                        {offer.contact_email && (
                          <div className="flex items-center text-gray-700">
                            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <a href={`mailto:${offer.contact_email}`} className="hover:text-primary-600">
                              {offer.contact_email}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Start Chat Button */}
                {!isOwner && user && (
                  <button
                    onClick={handleStartChat}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>{t('messages.startChat')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            {!isOwner && offer.status === 'active' && (
              <div className="border-t pt-6">
                {canCreateRequests() ? (
                  <button className="btn-primary w-full py-4 text-lg">
                    {t('registry.contactDonor')}
                  </button>
                ) : (
                  <div className="text-center text-gray-600">
                    <p className="mb-4">{t('registry.loginToContact')}</p>
                    <Link to="/login" className="btn-primary">
                      {t('common.login')}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Matching Requests Section */}
        {matchingRequests.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {t('matching.matchingRequests')} 📝
              </h2>
              <Link
                to="/requests"
                className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
              >
                {t('matching.viewAllRequests')} →
              </Link>
            </div>

            <p className="text-gray-600 mb-6">
              {t('matching.matchingRequestsDescription')}
            </p>

            <div className="space-y-4">
              {matchingRequests.map(({ request, score, reasons }) => {
                const quality = getMatchQuality(score)
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

                return (
                  <Link
                    key={request.id}
                    to={`/requests/${request.id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {request.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${quality.bgColor} ${quality.color}`}>
                            {quality.label}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(request.priority)}`}>
                            {t(`priority.${request.priority}`)}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            {t(`categories.${request.category}`)}
                          </span>
                          <span className="text-sm text-gray-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {request.location.city}
                          </span>
                        </div>
                        {request.vulnerable_categories && request.vulnerable_categories.length > 0 && (
                          <div className="mt-2">
                            <VulnerableCategoryBadges categories={request.vulnerable_categories} />
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-primary-600">
                          {score}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('matching.matchScore')}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                      {request.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-semibold text-primary-600">
                            {request.beneficiary?.first_name?.[0] || 'B'}
                          </span>
                        </div>
                        <span>
                          {request.beneficiary?.first_name} {request.beneficiary?.last_name}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500">
                        {reasons.slice(0, 2).join(' • ')}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/requests"
                className="btn-primary inline-block"
              >
                {t('matching.browseMoreRequests')}
              </Link>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6">
          <Link to="/registry" className="btn-secondary">
            ← {t('registry.backToRegistry')}
          </Link>
        </div>
      </div>
    </div>
  )
}
