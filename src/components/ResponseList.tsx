import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { responsesService } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'
import { Response } from '../types'
import VerifiedBadge from './VerifiedBadge'

interface ResponseListProps {
  requestId: string
  isOwner: boolean
}

export default function ResponseList({ requestId, isOwner }: ResponseListProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: responses, isLoading } = useQuery({
    queryKey: ['responses', requestId],
    queryFn: async () => {
      return await responsesService.getAll({ request_id: requestId })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      responseId,
      status,
    }: {
      responseId: string
      status: 'accepted' | 'rejected'
    }) => {
      return await responsesService.updateStatus(responseId, status)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responses', requestId] })
      queryClient.invalidateQueries({ queryKey: ['helpRequest', requestId] })
    },
  })

  const handleAccept = (responseId: string) => {
    if (window.confirm(t('responses.confirmAccept'))) {
      updateStatusMutation.mutate({ responseId, status: 'accepted' })
    }
  }

  const handleReject = (responseId: string) => {
    if (window.confirm(t('responses.confirmReject'))) {
      updateStatusMutation.mutate({ responseId, status: 'rejected' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!responses || responses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{t('responses.noResponses')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">
        {t('responses.responses')} ({responses.length})
      </h3>

      {responses.map((response: any) => (
        <div key={response.id} className="bg-white rounded-lg shadow-md p-6 border">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-lg font-bold text-primary-600">
                  {response.donor?.first_name?.[0] || '?'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">
                    {response.donor?.first_name} {response.donor?.last_name}
                  </h4>
                  {response.donor?.verified && <VerifiedBadge verified={true} size="sm" />}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(response.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                response.status
              )}`}
            >
              {t(`responses.status_${response.status}`)}
            </span>
          </div>

          {/* Message */}
          <div className="mb-4">
            <p className="text-gray-700">{response.message}</p>
          </div>

          {/* Offered Items */}
          {response.offered_items && response.offered_items.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <h5 className="font-medium text-sm mb-2">{t('responses.offeredItems')}:</h5>
              <ul className="space-y-1">
                {response.offered_items.map((item: any) => (
                  <li key={item.id} className="text-sm text-gray-700">
                    • {item.name} - {item.quantity} {item.unit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons (only for owner and pending responses) */}
          {isOwner && response.status === 'pending' && (
            <div className="flex gap-3 pt-3 border-t">
              <button
                onClick={() => handleAccept(response.id)}
                disabled={updateStatusMutation.isPending}
                className="flex-1 btn-primary bg-green-600 hover:bg-green-700"
              >
                ✓ {t('responses.accept')}
              </button>
              <button
                onClick={() => handleReject(response.id)}
                disabled={updateStatusMutation.isPending}
                className="flex-1 btn-secondary text-red-600 hover:text-red-800"
              >
                ✗ {t('responses.reject')}
              </button>
            </div>
          )}

          {/* Contact Info (if accepted) */}
          {response.status === 'accepted' && response.donor && (
            <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-2">
                {t('responses.contactInfo')}:
              </p>
              <div className="text-sm text-gray-700 space-y-1">
                {response.donor.phone && (
                  <p>
                    📞 <a href={`tel:${response.donor.phone}`} className="text-primary-600 hover:underline">{response.donor.phone}</a>
                  </p>
                )}
                {response.donor.email && (
                  <p>
                    ✉️ <a href={`mailto:${response.donor.email}`} className="text-primary-600 hover:underline">{response.donor.email}</a>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
