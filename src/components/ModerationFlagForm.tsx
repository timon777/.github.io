import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { moderationService } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'
import type { ModerationContentType, ModerationReason } from '../types'

interface ModerationFlagFormProps {
  contentType: ModerationContentType
  contentId: string
  reportedUserId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ModerationFlagForm({
  contentType,
  contentId,
  reportedUserId,
  onSuccess,
  onCancel,
}: ModerationFlagFormProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [reason, setReason] = useState<ModerationReason>('spam')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reasons: ModerationReason[] = [
    'spam',
    'inappropriate',
    'harassment',
    'fraud',
    'false_info',
    'other',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert(t('auth.pleaseLogin'))
      return
    }

    if (!description.trim()) {
      alert(t('moderation.descriptionRequired'))
      return
    }

    setIsSubmitting(true)

    try {
      await moderationService.create({
        reporter_id: user.id,
        content_type: contentType,
        content_id: contentId,
        reported_user_id: reportedUserId,
        reason,
        description: description.trim(),
      })

      alert(t('moderation.reportSubmitted'))
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting report:', error)
      alert(t('common.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">{t('moderation.reportContent')}</h2>

        <form onSubmit={handleSubmit}>
          {/* Reason Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('moderation.reason')}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ModerationReason)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {t(`moderation.reasons.${r}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('moderation.description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
              placeholder={t('moderation.descriptionPlaceholder')}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {t('moderation.descriptionHint')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.submitting') : t('moderation.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
