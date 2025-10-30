import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { verificationService } from '../services/supabase'
import type { VerificationType } from '../types'
import ImageUpload from '../components/ImageUpload'

export default function VerificationRequestPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [type, setType] = useState<VerificationType>('individual')
  const [fullName, setFullName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [phone, setPhone] = useState(user?.phone || '')
  const [email, setEmail] = useState(user?.email || '')
  const [documents, setDocuments] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDocumentUpload = (url: string) => {
    setDocuments([...documents, url])
  }

  const handleDocumentRemove = (url: string) => {
    setDocuments(documents.filter(doc => doc !== url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    if (documents.length === 0) {
      alert(t('verification.uploadDocuments'))
      return
    }

    setIsSubmitting(true)

    try {
      await verificationService.create({
        user_id: user.id,
        type,
        full_name: type === 'individual' ? fullName : undefined,
        organization_name: type !== 'individual' ? organizationName : undefined,
        registration_number: type !== 'individual' ? registrationNumber : undefined,
        phone,
        email,
        documents,
      })

      alert(t('verification.requestSubmitted'))
      navigate('/profile')
    } catch (error) {
      console.error('Error submitting verification request:', error)
      alert(t('verification.errorSubmitting'))
    } finally {
      setIsSubmitting(false)
    }
  }

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

  if (user.verified) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">{t('verification.verified')}</h1>
            <p className="text-gray-600 mb-6">{t('verification.alreadyVerified')}</p>
            <Link to="/profile" className="btn-primary">
              {t('nav.profile')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-gray-600">
          <Link to="/" className="hover:text-primary-600">{t('nav.home')}</Link>
          <span className="mx-2">/</span>
          <Link to="/profile" className="hover:text-primary-600">{t('nav.profile')}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{t('verification.requestVerification')}</span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{t('verification.requestVerification')}</h1>
            <p className="text-gray-600">
              {t('verification.description')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Verification Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('verification.type')} *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['individual', 'organization', 'business', 'government'].map((t_type) => (
                  <label
                    key={t_type}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      type === t_type
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t_type}
                      checked={type === t_type}
                      onChange={(e) => setType(e.target.value as VerificationType)}
                      className="mr-3"
                    />
                    <span className="font-medium">{t(`verification.${t_type}`)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Individual Fields */}
            {type === 'individual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('verification.fullName')} *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  required
                  placeholder={t('verification.fullName')}
                />
              </div>
            )}

            {/* Organization Fields */}
            {type !== 'individual' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('verification.organizationName')} *
                  </label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="input-field"
                    required
                    placeholder={t('verification.organizationName')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('verification.registrationNumber')} *
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="input-field"
                    required
                    placeholder={t('verification.registrationNumber')}
                  />
                </div>
              </>
            )}

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.phone')} *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                required
                placeholder="+7 (___) ___-__-__"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')} *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
                disabled
              />
            </div>

            {/* Documents Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('verification.documents')} *
              </label>
              <p className="text-sm text-gray-600 mb-3">
                {t('verification.documentsHelp')}
              </p>
              <ImageUpload
                onUpload={handleDocumentUpload}
                maxFiles={5}
                bucket="verification-documents"
              />

              {documents.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {documents.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Document ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleDocumentRemove(url)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || documents.length === 0}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('verification.submitting') : t('verification.submit')}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
