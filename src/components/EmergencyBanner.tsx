import { useTranslation } from 'react-i18next'
import { useEmergencyStore } from '../stores/emergencyStore'

export default function EmergencyBanner() {
  const { t } = useTranslation()
  const { isEmergencyMode, emergencyReason, emergencyStartedAt } = useEmergencyStore()

  if (!isEmergencyMode) return null

  const startedDate = emergencyStartedAt
    ? new Date(emergencyStartedAt).toLocaleString()
    : ''

  return (
    <div className="bg-red-600 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🚨</span>
              <div>
                <h3 className="font-bold text-lg">
                  {t('emergency.modeActive')}
                </h3>
                {emergencyReason && (
                  <p className="text-sm text-red-100">
                    {t('emergency.reason')}: {emergencyReason}
                  </p>
                )}
                {startedDate && (
                  <p className="text-xs text-red-100">
                    {t('emergency.since')}: {startedDate}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="text-sm text-red-100">
            {t('emergency.priorityBoostActive')}
          </div>
        </div>
      </div>
    </div>
  )
}
