import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { verificationService } from '../services/supabase'
import type { VerificationRequest, VerificationStatus, VerificationType } from '../types'

export default function AdminVerificationPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<VerificationType | 'all'>('all')
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [statusFilter, typeFilter])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const filters: any = {}
      if (statusFilter !== 'all') filters.status = statusFilter
      if (typeFilter !== 'all') filters.type = typeFilter

      const data = await verificationService.getAll(filters)
      setRequests(data)
    } catch (error) {
      console.error('Error loading verification requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    if (!user) return

    setProcessing(true)
    try {
      await verificationService.updateStatus(requestId, 'approved', user.id)
      alert(t('verification.approved'))
      setShowModal(false)
      loadRequests()
    } catch (error) {
      console.error('Error approving request:', error)
      alert(t('common.error'))
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!user || !rejectionReason.trim()) {
      alert(t('verification.rejectionReasonRequired'))
      return
    }

    setProcessing(true)
    try {
      await verificationService.updateStatus(requestId, 'rejected', user.id, rejectionReason)
      alert(t('verification.rejected'))
      setShowModal(false)
      setRejectionReason('')
      loadRequests()
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert(t('common.error'))
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: VerificationType) => {
    switch (type) {
      case 'individual':
        return '👤'
      case 'organization':
        return '🏢'
      case 'business':
        return '💼'
      case 'government':
        return '🏛️'
      default:
        return '📄'
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
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('verification.title')} - {t('admin.panel')}</h1>
          <p className="text-gray-600">{t('verification.adminDescription')}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('verification.status')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="input-field"
              >
                <option value="all">{t('common.all')}</option>
                <option value="pending">{t('verification.pending')}</option>
                <option value="under_review">{t('verification.underReview')}</option>
                <option value="approved">{t('verification.approved')}</option>
                <option value="rejected">{t('verification.rejected')}</option>
                <option value="expired">{t('verification.expired')}</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('verification.type')}
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="input-field"
              >
                <option value="all">{t('common.all')}</option>
                <option value="individual">{t('verification.individual')}</option>
                <option value="organization">{t('verification.organization')}</option>
                <option value="business">{t('verification.business')}</option>
                <option value="government">{t('verification.government')}</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {t('verification.totalRequests')}: <span className="font-semibold">{requests.length}</span>
            </div>
            <button onClick={loadRequests} className="btn-secondary text-sm">
              🔄 {t('common.refresh')}
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-xl text-gray-600">{t('verification.noRequests')}</p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedRequest(request)
                  setShowModal(true)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(request.type)}</span>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {request.type === 'individual'
                            ? request.full_name
                            : request.organization_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {request.user?.email || request.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {t(`verification.${request.status}`)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        {t(`verification.${request.type}`)}
                      </span>
                      {request.registration_number && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {request.registration_number}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      <span>{t('common.created')}: </span>
                      <span className="font-medium">
                        {new Date(request.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <button className="btn-primary text-sm">
                      {t('common.view')} →
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{t('verification.requestDetails')}</h2>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setRejectionReason('')
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Type and Status */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getTypeIcon(selectedRequest.type)}</span>
                  <div>
                    <div className="text-sm text-gray-600">{t('verification.type')}</div>
                    <div className="font-semibold">{t(`verification.${selectedRequest.type}`)}</div>
                  </div>
                  <span className={`ml-auto px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedRequest.status)}`}>
                    {t(`verification.${selectedRequest.status}`)}
                  </span>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRequest.full_name && (
                    <div>
                      <div className="text-sm text-gray-600">{t('verification.fullName')}</div>
                      <div className="font-semibold">{selectedRequest.full_name}</div>
                    </div>
                  )}
                  {selectedRequest.organization_name && (
                    <div>
                      <div className="text-sm text-gray-600">{t('verification.organizationName')}</div>
                      <div className="font-semibold">{selectedRequest.organization_name}</div>
                    </div>
                  )}
                  {selectedRequest.registration_number && (
                    <div>
                      <div className="text-sm text-gray-600">{t('verification.registrationNumber')}</div>
                      <div className="font-semibold">{selectedRequest.registration_number}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600">{t('auth.phone')}</div>
                    <div className="font-semibold">{selectedRequest.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{t('auth.email')}</div>
                    <div className="font-semibold">{selectedRequest.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{t('common.created')}</div>
                    <div className="font-semibold">
                      {new Date(selectedRequest.created_at).toLocaleString('ru-RU')}
                    </div>
                  </div>
                </div>

                {/* Documents */}
                {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">{t('verification.documents')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedRequest.documents.map((doc: string, index: number) => (
                        <a
                          key={index}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative group"
                        >
                          <img
                            src={doc}
                            alt={`Document ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 hover:border-primary-500 transition-colors"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-opacity flex items-center justify-center">
                            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Info */}
                {selectedRequest.reviewed_by && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{t('verification.reviewInfo')}</h3>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-gray-600">{t('verification.reviewedBy')}:</span>{' '}
                        <span className="font-medium">
                          {selectedRequest.reviewer?.first_name} {selectedRequest.reviewer?.last_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">{t('verification.reviewedAt')}:</span>{' '}
                        <span className="font-medium">
                          {new Date(selectedRequest.reviewed_at).toLocaleString('ru-RU')}
                        </span>
                      </div>
                      {selectedRequest.rejection_reason && (
                        <div>
                          <span className="text-gray-600">{t('verification.rejectionReason')}:</span>{' '}
                          <span className="font-medium text-red-600">{selectedRequest.rejection_reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedRequest.status === 'pending' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedRequest.id)}
                        disabled={processing}
                        className="btn-primary flex-1 disabled:opacity-50"
                      >
                        ✅ {t('verification.approve')}
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('verification.rejectionReason')}
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="input-field"
                        rows={3}
                        placeholder={t('verification.rejectionReasonPlaceholder')}
                      />
                      <button
                        onClick={() => handleReject(selectedRequest.id)}
                        disabled={processing || !rejectionReason.trim()}
                        className="btn-secondary mt-2 w-full disabled:opacity-50"
                      >
                        ❌ {t('verification.reject')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
