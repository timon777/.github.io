import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { reviewsService } from '../services/supabase'
import { Review } from '../types'

interface ReviewsListProps {
  userId: string
  showAddButton?: boolean
  onAddReview?: () => void
}

export default function ReviewsList({ userId, showAddButton = false, onAddReview }: ReviewsListProps) {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 })

  useEffect(() => {
    loadReviews()
  }, [userId])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const [reviewsData, statsData] = await Promise.all([
        reviewsService.getForUser(userId),
        reviewsService.getAverageRating(userId),
      ])
      setReviews(reviewsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClass = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    }[size]

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            fill={star <= rating ? 'currentColor' : 'none'}
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
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('reviews.overallRating')}</h3>
            <div className="flex items-center space-x-3">
              <div className="text-4xl font-bold text-primary-600">
                {stats.avg > 0 ? stats.avg.toFixed(1) : '—'}
              </div>
              <div>
                {renderStars(Math.round(stats.avg), 'lg')}
                <p className="text-sm text-gray-600 mt-1">
                  {t('reviews.basedOn', { count: stats.count })}
                </p>
              </div>
            </div>
          </div>

          {showAddButton && onAddReview && (
            <button onClick={onAddReview} className="btn-primary">
              {t('reviews.writeReview')}
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
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
          <p className="text-gray-600">{t('reviews.noReviews')}</p>
          {showAddButton && onAddReview && (
            <button onClick={onAddReview} className="mt-4 btn-secondary">
              {t('reviews.beFirst')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Reviewer Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                    {review.reviewer?.first_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.reviewer?.first_name} {review.reviewer?.last_name}
                    </h4>
                    <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  {renderStars(review.rating, 'md')}
                  <span className="text-lg font-semibold text-gray-900">{review.rating}.0</span>
                </div>
              </div>

              {/* Detailed Ratings */}
              {(review.communication_rating || review.reliability_rating || review.quality_rating) && (
                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  {review.communication_rating && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">{t('reviews.communication')}</p>
                      {renderStars(review.communication_rating, 'sm')}
                    </div>
                  )}
                  {review.reliability_rating && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">{t('reviews.reliability')}</p>
                      {renderStars(review.reliability_rating, 'sm')}
                    </div>
                  )}
                  {review.quality_rating && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">{t('reviews.quality')}</p>
                      {renderStars(review.quality_rating, 'sm')}
                    </div>
                  )}
                </div>
              )}

              {/* Comment */}
              {review.comment && (
                <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
              )}

              {/* Context */}
              {(review.request || review.offer) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    {review.request && `📝 ${t('reviews.forRequest')}: ${review.request.title}`}
                    {review.offer && `🎁 ${t('reviews.forOffer')}: ${review.offer.title}`}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
