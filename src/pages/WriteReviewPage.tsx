import { useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../services/supabase'
import ReviewForm from '../components/ReviewForm'

export default function WriteReviewPage() {
  const { userId } = useParams<{ userId: string }>()
  const [searchParams] = useSearchParams()
  const requestId = searchParams.get('requestId')
  const offerId = searchParams.get('offerId')
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const { data: reviewee, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID')
      const { data, error } = await supabase!
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">{t('common.loginRequired')}</h1>
          <Link to="/login" className="btn-primary">
            {t('common.login')}
          </Link>
        </div>
      </div>
    )
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

  if (!reviewee || reviewee.id === user.id) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">{t('reviews.cannotReviewSelf')}</h1>
          <Link to="/" className="btn-primary">
            {t('nav.home')}
          </Link>
        </div>
      </div>
    )
  }

  const handleSuccess = () => {
    navigate(-1) // Go back to previous page
  }

  const handleCancel = () => {
    navigate(-1) // Go back to previous page
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-gray-600">
          <Link to="/" className="hover:text-primary-600">{t('nav.home')}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{t('reviews.writeReview')}</span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{t('reviews.writeReview')}</h1>
            <p className="text-gray-600">
              {t('reviews.reviewFor')}: <span className="font-semibold">
                {reviewee.first_name} {reviewee.last_name}
              </span>
            </p>
          </div>

          <ReviewForm
            revieweeId={reviewee.id}
            revieweeName={`${reviewee.first_name} ${reviewee.last_name}`}
            requestId={requestId || undefined}
            offerId={offerId || undefined}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            ← {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  )
}
