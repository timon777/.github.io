import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'
import { authService, usersService } from '../services/supabase'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, userData: any) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const { user: authUser } = await authService.signIn(email, password)
          if (authUser) {
            // Get full user profile from users table
            const userProfile = await usersService.getProfile(authUser.id)
            set({ user: userProfile as User, isAuthenticated: true, isLoading: false })
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (email: string, password: string, userData: any) => {
        set({ isLoading: true })
        try {
          const { user: authUser } = await authService.signUp(email, password, userData)
          if (authUser) {
            // Auto sign in after registration
            const { user: signedInUser } = await authService.signIn(email, password)
            if (signedInUser) {
              const userProfile = await usersService.getProfile(signedInUser.id)
              set({ user: userProfile as User, isAuthenticated: true, isLoading: false })
            }
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.signOut()
          set({ user: null, isAuthenticated: false, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },

      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const authUser = await authService.getCurrentUser()
          if (authUser) {
            const userProfile = await usersService.getProfile(authUser.id)
            set({ user: userProfile as User, isAuthenticated: true, isLoading: false })
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false })
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
