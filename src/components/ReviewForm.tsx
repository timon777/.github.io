import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { reviewsService } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'

interface ReviewFormProps {
  revieweeId: string
  revieweeName: string
  requestId?: string
  offerId?: string
  responseId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ReviewForm({
  revieweeId,
  revieweeName,
  requestId,
  offerId,
  responseId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [communicationRating, setCommunicationRating] = useState(0)
  const [reliabilityRating, setReliabilityRating] = useState(0)
  const [qualityRating, setQualityRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError(t('reviews.loginRequired'))
      return
    }

    if (rating === 0) {
      setError(t('reviews.ratingRequired'))
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      await reviewsService.create({
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim() || undefined,
        communication_rating: communicationRating || undefined,
        reliability_rating: reliabilityRating || undefined,
        quality_rating: qualityRating || undefined,
        request_id: requestId,
        offer_id: offerId,
        response_id: responseId,
      })

      onSuccess?.()
    } catch (err: any) {
      console.error('Error submitting review:', err)
      if (err.message.includes('unique')) {
        setError(t('reviews.alreadyReviewed'))
      } else {
        setError(t('reviews.errorSubmitting'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (value: number, onChange: (val: number) => void, label: string) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <svg
                className={`w-8 h-8 ${
                  star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
                fill={star <= value ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {value > 0 ? `${value}/5` : t('reviews.notRated')}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">
        {t('reviews.writeReview')} {revieweeName}
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Overall Rating */}
        {renderStars(rating, setRating, t('reviews.overallRating') + ' *')}

        {/* Detailed Ratings */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('reviews.detailedRatings')}</h4>

          {renderStars(communicationRating, setCommunicationRating, t('reviews.communication'))}
          {renderStars(reliabilityRating, setReliabilityRating, t('reviews.reliability'))}
          {renderStars(qualityRating, setQualityRating, t('reviews.quality'))}
        </div>

        {/* Comment */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('reviews.comment')} ({t('common.optional')})
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={t('reviews.commentPlaceholder')}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 {t('reviews.characters')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={submitting}
            >
              {t('common.cancel')}
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={submitting || rating === 0}>
            {submitting ? t('reviews.submitting') : t('reviews.submitReview')}
          </button>
        </div>
      </form>
    </div>
  )
}
