import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EmergencyStore {
  isEmergencyMode: boolean
  emergencyStartedAt: string | null
  emergencyReason: string | null
  setEmergencyMode: (enabled: boolean, reason?: string) => void
  clearEmergency: () => void
}

export const useEmergencyStore = create<EmergencyStore>()(
  persist(
    (set) => ({
      isEmergencyMode: false,
      emergencyStartedAt: null,
      emergencyReason: null,

      setEmergencyMode: (enabled, reason) => {
        set({
          isEmergencyMode: enabled,
          emergencyStartedAt: enabled ? new Date().toISOString() : null,
          emergencyReason: enabled ? reason || null : null,
        })
      },

      clearEmergency: () => {
        set({
          isEmergencyMode: false,
          emergencyStartedAt: null,
          emergencyReason: null,
        })
      },
    }),
    {
      name: 'emergency-mode',
    }
  )
)
