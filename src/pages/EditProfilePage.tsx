import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { supabase, storageService } from '../services/supabase'
import ImageUpload from '../components/ImageUpload'

export default function EditProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '')
      setLastName(user.last_name || '')
      setPhoneNumber(user.phone || '')
      setBio(user.bio || '')
      setAvatarUrl(user.avatar_url || '')
    }
  }, [user])

  const handleAvatarUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setAvatarUrl(urls[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) return

    if (!firstName.trim() || !lastName.trim()) {
      setError(t('profile.nameRequired'))
      return
    }

    setLoading(true)

    try {
      const updates = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phoneNumber.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase!
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (updateError) throw updateError

      // Update local user state
      updateUser({
        ...user,
        ...updates,
      })

      alert(t('profile.updateSuccess'))
      navigate('/profile')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError(error.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('auth.pleaseLogin')}</h1>
          <Link to="/login" className="btn-primary">
            {t('common.login')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('profile.editProfile')}</h1>
            <p className="text-gray-600">{t('profile.editDescription')}</p>
          </div>
          <Link to="/profile" className="btn-secondary">
            {t('common.cancel')}
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* Avatar */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.avatar')}
              </label>
              <div className="flex items-center gap-6">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary-600">
                      {firstName[0] || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <ImageUpload
                    folder="users"
                    onUpload={handleAvatarUpload}
                    maxFiles={1}
                    existingImages={avatarUrl ? [avatarUrl] : []}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {t('profile.avatarHint')}
                  </p>
                </div>
              </div>
            </div>

            {/* First Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.firstName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Last Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.lastName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('registry.phone')}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+7 (123) 456-7890"
              />
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.bio')}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder={t('profile.bioPlaceholder')}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <Link to="/profile" className="flex-1 btn-secondary text-center">
                {t('common.cancel')}
              </Link>
              <button
                type="submit"
                className="flex-1 btn-primary"
                disabled={loading}
              >
                {loading ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </div>

        {/* Account Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">{t('profile.accountInfo')}</h2>

          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">{t('auth.email')}:</span>
              <span className="ml-2 text-gray-600">{user.email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">{t('auth.role')}:</span>
              <span className="ml-2 text-gray-600">
                {t(`roles.${user.role}`)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">{t('profile.memberSince')}:</span>
              <span className="ml-2 text-gray-600">
                {new Date(user.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            {t('profile.accountInfoHint')}
          </p>
        </div>
      </div>
    </div>
  )
}
