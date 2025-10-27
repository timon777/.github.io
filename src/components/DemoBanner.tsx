import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { isDemoMode } from '../services/supabase'

export default function DemoBanner() {
  const { t } = useTranslation()
  const [forceDemo, setForceDemo] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user manually enabled demo mode
    const forcedDemo = localStorage.getItem('forceDemo') === 'true'
    setForceDemo(forcedDemo)
    setShowBanner(isDemoMode || forcedDemo)
  }, [])

  const toggleDemoMode = () => {
    const newValue = !forceDemo
    setForceDemo(newValue)
    localStorage.setItem('forceDemo', String(newValue))

    if (newValue || isDemoMode) {
      setShowBanner(true)
    } else {
      setShowBanner(false)
    }

    // Reload page to apply changes
    window.location.reload()
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-orange-400 to-amber-500 text-white px-4 py-2 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">⚠️</span>
          <span className="text-sm font-medium">
            {t('demo.banner')}
          </span>
        </div>

        <button
          onClick={toggleDemoMode}
          className="flex items-center space-x-2 px-4 py-1.5 bg-white text-orange-600 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>{forceDemo ? t('demo.switchToReal') : t('demo.switchToDemo')}</span>
        </button>
      </div>
    </div>
  )
}
