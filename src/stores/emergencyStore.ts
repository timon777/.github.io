import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type EmergencyState = {
  isEmergency: boolean
  lastActivatedAt: string | null
  activate: () => void
  deactivate: () => void
  toggle: () => void
}

export const useEmergencyStore = create<EmergencyState>()(
  persist(
    (set, get) => ({
      isEmergency: false,
      lastActivatedAt: null,
      activate: () => {
        const timestamp = new Date().toISOString()
        set({ isEmergency: true, lastActivatedAt: timestamp })
      },
      deactivate: () => {
        set({ isEmergency: false })
      },
      toggle: () => {
        const nextState = !get().isEmergency
        set({
          isEmergency: nextState,
          lastActivatedAt: nextState ? new Date().toISOString() : get().lastActivatedAt,
        })
      },
    }),
    {
      name: 'emergency-mode',
    }
  )
)

export const getEmergencyState = () => useEmergencyStore.getState()
