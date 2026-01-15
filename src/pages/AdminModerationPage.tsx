import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { moderationService } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'
import type { ModerationFlag, ModerationStatus, ModerationContentType } from '../types'

export default function AdminModerationPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [flags, setFlags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ModerationStatus | 'all'>('all')
  const [contentTypeFilter, setContentTypeFilter] = useState<ModerationContentType | 'all'>('all')
  const [selectedFlag, setSelectedFlag] = useState<any | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionNote, setActionNote] = useState('')

  useEffect(() => {
    loadFlags()
  }, [statusFilter, contentTypeFilter])

  const loadFlags = async () => {
    try {
      setLoading(true)
      const filters: any = {}
      if (statusFilter !== 'all') filters.status = statusFilter
      if (contentTypeFilter !== 'all') filters.content_type = contentTypeFilter
      const data = await moderationService.getAll(filters)
      setFlags(data)
    } catch (error) {
      console.error('Error loading flags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (flagId: string, action: 'approved' | 'rejected') => {
    if (!user) return

    try {
      await moderationService.updateStatus(flagId, 'resolved', user.id, action, actionNote || undefined)
      alert(t('moderation.resolved'))
      setShowModal(false)
      setSelectedFlag(null)
      setActionNote('')
      loadFlags()
    } catch (error) {
      console.error('Error resolving flag:', error)
      alert(t('common.error'))
    }
  }

  const handleDismiss = async (flagId: string) => {
    if (!user) return

    try {
      await moderationService.updateStatus(flagId, 'dismissed', user.id)
      alert(t('moderation.dismissed'))
      setShowModal(false)
      setSelectedFlag(null)
      loadFlags()
    } catch (error) {
      console.error('Error dismissing flag:', error)
      alert(t('common.error'))
    }
  }

  const getStatusColor = (status: ModerationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getContentTypeIcon = (type: ModerationContentType) => {
    switch (type) {
      case 'request':
        return '📝'
      case 'offer':
        return '🎁'
      case 'review':
        return '⭐'
      case 'user':
        return '👤'
      default:
        return '❓'
    }
  }

  if (loading) {
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
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">🛡️ {t('moderation.title')}</h1>
            <p className="text-gray-600">{t('moderation.adminDescription')}</p>
          </div>
          <Link to="/admin/dashboard" className="btn-secondary">
            ← {t('admin.backToDashboard')}
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('moderation.status')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">{t('common.all')}</option>
                <option value="pending">{t('moderation.pending')}</option>
                <option value="under_review">{t('moderation.underReview')}</option>
                <option value="resolved">{t('moderation.resolved')}</option>
                <option value="dismissed">{t('moderation.dismissed')}</option>
              </select>
            </div>

            {/* Content Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('moderation.contentType')}
              </label>
              <select
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">{t('common.all')}</option>
                <option value="request">{t('moderation.contentTypes.request')}</option>
                <option value="offer">{t('moderation.contentTypes.offer')}</option>
                <option value="review">{t('moderation.contentTypes.review')}</option>
                <option value="user">{t('moderation.contentTypes.user')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">{flags.filter(f => f.status === 'pending').length}</div>
            <div className="text-sm text-gray-600">{t('moderation.pending')}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{flags.filter(f => f.status === 'under_review').length}</div>
            <div className="text-sm text-gray-600">{t('moderation.underReview')}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{flags.filter(f => f.status === 'resolved').length}</div>
            <div className="text-sm text-gray-600">{t('moderation.resolved')}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-600">{flags.filter(f => f.status === 'dismissed').length}</div>
            <div className="text-sm text-gray-600">{t('moderation.dismissed')}</div>
          </div>
        </div>

        {/* Flags List */}
        {flags.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">{t('moderation.noFlags')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {flags.map((flag) => (
              <div
                key={flag.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedFlag(flag)
                  setShowModal(true)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{getContentTypeIcon(flag.content_type)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(flag.status)}`}>
                        {t(`moderation.${flag.status}`)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        {t(`moderation.reasons.${flag.reason}`)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">
                      {t(`moderation.contentTypes.${flag.content_type}`)}
                    </h3>
                    <p className="text-gray-700 mb-3">{flag.description}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{t('moderation.reporter')}:</span>{' '}
                        {flag.reporter?.first_name} {flag.reporter?.last_name}
                      </div>
                      <div>
                        <span className="font-medium">{t('moderation.reported')}:</span>{' '}
                        {flag.reported_user?.first_name} {flag.reported_user?.last_name}
                      </div>
                      <div>
                        <span className="font-medium">{t('common.created')}:</span>{' '}
                        {new Date(flag.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>

                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedFlag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{t('moderation.flagDetails')}</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedFlag(null)
                  setActionNote('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Flag Info */}
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('moderation.contentType')}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getContentTypeIcon(selectedFlag.content_type)}</span>
                  <span className="font-semibold">{t(`moderation.contentTypes.${selectedFlag.content_type}`)}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('moderation.reason')}</h3>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                  {t(`moderation.reasons.${selectedFlag.reason}`)}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('moderation.description')}</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedFlag.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('moderation.reporter')}</h3>
                  <p className="font-semibold">
                    {selectedFlag.reporter?.first_name} {selectedFlag.reporter?.last_name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('moderation.reported')}</h3>
                  <p className="font-semibold">
                    {selectedFlag.reported_user?.first_name} {selectedFlag.reported_user?.last_name}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('moderation.status')}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedFlag.status)}`}>
                  {t(`moderation.${selectedFlag.status}`)}
                </span>
              </div>

              {selectedFlag.reviewed_by && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('moderation.reviewedBy')}</h3>
                  <p className="font-semibold">
                    {selectedFlag.reviewer?.first_name} {selectedFlag.reviewer?.last_name}
                  </p>
                  {selectedFlag.action_taken && (
                    <p className="text-sm text-gray-600 mt-1">
                      {t('moderation.action')}: {t(`moderation.actions.${selectedFlag.action_taken}`)}
                    </p>
                  )}
                  {selectedFlag.action_note && (
                    <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                      {selectedFlag.action_note}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Form */}
            {selectedFlag.status === 'pending' || selectedFlag.status === 'under_review' ? (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">{t('moderation.takeAction')}</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('moderation.actionNote')}
                  </label>
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder={t('moderation.actionNotePlaceholder')}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDismiss(selectedFlag.id)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t('moderation.dismiss')}
                  </button>
                  <button
                    onClick={() => handleResolve(selectedFlag.id, 'rejected')}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    {t('moderation.reject')}
                  </button>
                  <button
                    onClick={() => handleResolve(selectedFlag.id, 'approved')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t('moderation.approve')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-600">
                {t('moderation.alreadyProcessed')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
