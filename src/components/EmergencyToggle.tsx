import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useEmergencyStore } from '../stores/emergencyStore'
import { useAuthStore } from '../stores/authStore'

export default function EmergencyToggle() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { isEmergencyMode, setEmergencyMode, clearEmergency } = useEmergencyStore()
  const [showDialog, setShowDialog] = useState(false)
  const [reason, setReason] = useState('')

  // Only admins can toggle emergency mode
  if (!user || user.role !== 'admin') return null

  const handleActivate = () => {
    setEmergencyMode(true, reason || undefined)
    setShowDialog(false)
    setReason('')
  }

  const handleDeactivate = () => {
    if (window.confirm(t('emergency.confirmDeactivate'))) {
      clearEmergency()
    }
  }

  return (
    <div className="relative">
      {!isEmergencyMode ? (
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <span>🚨</span>
          <span className="font-medium">{t('emergency.activate')}</span>
        </button>
      ) : (
        <button
          onClick={handleDeactivate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors animate-pulse"
        >
          <span>✓</span>
          <span className="font-medium">{t('emergency.deactivate')}</span>
        </button>
      )}

      {/* Activation Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-red-600">
              {t('emergency.activateTitle')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('emergency.activateDescription')}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('emergency.reasonLabel')} ({t('common.optional')})
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input-field"
                rows={3}
                placeholder={t('emergency.reasonPlaceholder')}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleActivate}
                className="flex-1 btn-primary bg-red-600 hover:bg-red-700"
              >
                {t('emergency.confirmActivate')}
              </button>
              <button
                onClick={() => {
                  setShowDialog(false)
                  setReason('')
                }}
                className="flex-1 btn-secondary"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
