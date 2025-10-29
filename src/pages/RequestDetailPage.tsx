import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { requestsService } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'
import { useRoleAccess } from '../hooks/useRoleAccess'
import VerifiedBadge from '../components/VerifiedBadge'

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { canCreateOffers } = useRoleAccess()

  const { data: request, isLoading } = useQuery({
    queryKey: ['helpRequest', id],
    queryFn: async () => {
      if (!id) throw new Error('No request ID')
      const data = await requestsService.getById(id)
      return data
    },
    enabled: !!id,
  })

  const isOwner = user && request && user.id === request.beneficiary_id

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return t('requests.open')
      case 'in_progress':
        return t('requests.inProgress')
      case 'closed':
        return t('requests.closed')
      default:
        return status
    }
  }

  const getPriorityLabel = (priority: string) => {
    return t(`requests.${priority}`)
  }

  const handleDelete = async () => {
    if (!request || !window.confirm(t('requests.confirmDelete'))) return

    try {
      await requestsService.delete(request.id)
      navigate('/requests')
    } catch (error) {
      console.error('Ошибка при удалении:', error)
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

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('requests.notFound')}</h1>
          <Link to="/requests" className="btn-primary">
            {t('requests.backToRequests')}
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
          <Link to="/requests" className="hover:text-primary-600">{t('nav.requests')}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{request.title}</span>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3">{request.title}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getPriorityColor(request.priority)}`}>
                    {getPriorityLabel(request.priority)}
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(request.status)}`}>
                    {getStatusLabel(request.status)}
                  </span>
                  <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                    {t(`categories.${request.category}`)}
                  </span>
                </div>
              </div>

              {isOwner && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/requests/${request.id}/edit`)}
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
              <h2 className="text-xl font-semibold mb-3">{t('requests.description')}</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{request.description}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('requests.priority')}</h3>
                <p className="text-lg font-semibold">
                  {getPriorityLabel(request.priority)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('requests.status')}</h3>
                <p className="text-lg font-semibold">
                  {getStatusLabel(request.status)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('registry.city')}</h3>
                <p className="text-lg font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {request.location.city}
                </p>
              </div>

              {request.location.address && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('registry.address')}</h3>
                  <p className="text-lg">{request.location.address}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('requests.created')}</h3>
                <p className="text-lg">
                  {new Date(request.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>

            {/* Beneficiary Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">{t('requests.beneficiary')}</h2>
              <div className="flex items-start">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {request.beneficiary?.first_name?.[0] || 'B'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold mr-2">
                      {request.beneficiary?.first_name} {request.beneficiary?.last_name}
                    </h3>
                    {request.beneficiary?.verified && <VerifiedBadge verified={true} />}
                  </div>
                  <p className="text-gray-600">
                    {t(`roles.${request.beneficiary?.role}`)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {!isOwner && request.status === 'open' && (
              <div className="border-t pt-6">
                {canCreateOffers() ? (
                  <button className="btn-primary w-full py-4 text-lg">
                    {t('requests.respond')}
                  </button>
                ) : (
                  <div className="text-center text-gray-600">
                    <p className="mb-4">{t('requests.loginToRespond')}</p>
                    <Link to="/login" className="btn-primary">
                      {t('common.login')}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Link to="/requests" className="btn-secondary">
            ← {t('requests.backToRequests')}
          </Link>
        </div>
      </div>
    </div>
  )
}
