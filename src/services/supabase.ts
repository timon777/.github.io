import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import {
  mockUsers,
  mockHelpRequests,
  mockShelters,
  mockVolunteers,
  mockDonorOffers,
  getMockAuthUser,
  setMockAuthUser,
} from './mockData'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Debug: log environment variables (only in development)
if (import.meta.env.DEV) {
  console.log('🔍 Supabase Config:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET',
    keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
    configured: !!(supabaseUrl && supabaseAnonKey)
  })
}

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create Supabase client (only if configured)
export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null

// Demo mode flag
export const isDemoMode = !isSupabaseConfigured

// Log mode (only in development)
if (import.meta.env.DEV) {
  if (isDemoMode) {
    console.warn('🔶 DEMO MODE: Supabase не настроен. Используются mock данные.')
    console.warn('📝 Для подключения к БД настройте .env файл (см. SUPABASE_SETUP.md)')
  } else {
    console.log('✅ Supabase configured - using real database')
  }
}

// Auth service
export const authService = {
  async signUp(email: string, password: string, userData: any) {
    if (isDemoMode) {
      // Demo mode: create mock user
      const mockUser = {
        ...mockUsers[0],
        email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
      }
      setMockAuthUser(mockUser)
      localStorage.setItem('demo_user', JSON.stringify(mockUser))
      return { user: mockUser as any, session: { access_token: 'demo-token' } as any }
    }

    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          role: userData.role,
        },
      },
    })

    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    if (isDemoMode) {
      // Demo mode: return mock user
      const mockUser = mockUsers[0]
      setMockAuthUser(mockUser)
      localStorage.setItem('demo_user', JSON.stringify(mockUser))
      console.log('✅ Demo login успешен:', email)
      return { user: mockUser as any, session: { access_token: 'demo-token' } as any }
    }

    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  async signOut() {
    if (isDemoMode) {
      setMockAuthUser(null)
      localStorage.removeItem('demo_user')
      console.log('✅ Demo logout')
      return
    }

    const { error } = await supabase!.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    if (isDemoMode) {
      const stored = localStorage.getItem('demo_user')
      if (stored) {
        const user = JSON.parse(stored)
        setMockAuthUser(user)
        return user
      }
      return null
    }

    const { data: { user }, error } = await supabase!.auth.getUser()
    if (error) throw error
    return user
  },

  async getCurrentSession() {
    if (isDemoMode) {
      const user = getMockAuthUser()
      return user ? { access_token: 'demo-token', user } as any : null
    }

    const { data: { session }, error } = await supabase!.auth.getSession()
    if (error) throw error
    return session
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (isDemoMode) {
      // Demo mode: no-op, return dummy unsubscribe
      return { data: { subscription: { unsubscribe: () => {} } } }
    }

    return supabase!.auth.onAuthStateChange(callback)
  },
}

// Help requests service
export const requestsService = {
  async getAll(filters?: any) {
    if (isDemoMode) {
      let data = [...mockHelpRequests]

      if (filters?.category) {
        data = data.filter((r) => r.category === filters.category)
      }
      if (filters?.status) {
        data = data.filter((r) => r.status === filters.status)
      }
      if (filters?.priority) {
        data = data.filter((r) => r.priority === filters.priority)
      }

      return data
    }

    let query = supabase!
      .from('help_requests')
      .select(`
        *,
        beneficiary:users!help_requests_beneficiary_id_fkey(*),
        location:locations(*)
      `)
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id: string) {
    if (isDemoMode) {
      return mockHelpRequests.find((r) => r.id === id) || null
    }

    const { data, error } = await supabase!
      .from('help_requests')
      .select(`
        *,
        beneficiary:users!help_requests_beneficiary_id_fkey(*),
        location:locations(*),
        responses(
          *,
          donor:users!responses_donor_id_fkey(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(requestData: any) {
    if (isDemoMode) {
      console.log('✅ Demo: создан запрос', requestData)
      return { id: 'demo-request-new', ...requestData, created_at: new Date().toISOString() }
    }

    const { data, error } = await supabase!
      .from('help_requests')
      .insert(requestData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    if (isDemoMode) {
      console.log('✅ Demo: обновлен запрос', id, updates)
      return { id, ...updates }
    }

    const { data, error } = await supabase!
      .from('help_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    if (isDemoMode) {
      console.log('✅ Demo: удален запрос', id)
      return
    }

    const { error } = await supabase!
      .from('help_requests')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

// Shelters service
export const sheltersService = {
  async getAll(filters?: any) {
    if (isDemoMode) {
      let data = [...mockShelters]

      if (filters?.type) {
        data = data.filter((s) => s.type === filters.type)
      }
      if (filters?.verified !== undefined) {
        data = data.filter((s) => s.verified === filters.verified)
      }

      return data
    }

    let query = supabase!
      .from('shelters')
      .select(`
        *,
        location:locations(*),
        manager:users!shelters_manager_id_fkey(*)
      `)
      .order('created_at', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.verified !== undefined) {
      query = query.eq('verified', filters.verified)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id: string) {
    if (isDemoMode) {
      return mockShelters.find((s) => s.id === id) || null
    }

    const { data, error } = await supabase!
      .from('shelters')
      .select(`
        *,
        location:locations(*),
        manager:users!shelters_manager_id_fkey(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(shelterData: any) {
    if (isDemoMode) {
      console.log('✅ Demo: создан приют', shelterData)
      return { id: 'demo-shelter-new', ...shelterData, created_at: new Date().toISOString() }
    }

    const { data, error } = await supabase!
      .from('shelters')
      .insert(shelterData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    if (isDemoMode) {
      console.log('✅ Demo: обновлен приют', id, updates)
      return { id, ...updates }
    }

    const { data, error } = await supabase!
      .from('shelters')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// Responses service
export const responsesService = {
  async create(responseData: any) {
    if (isDemoMode) {
      console.log('✅ Demo: создан отклик', responseData)
      return { id: 'demo-response-new', ...responseData, created_at: new Date().toISOString() }
    }

    const { data, error } = await supabase!
      .from('responses')
      .insert(responseData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    if (isDemoMode) {
      console.log('✅ Demo: обновлен отклик', id, updates)
      return { id, ...updates }
    }

    const { data, error } = await supabase!
      .from('responses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByRequestId(requestId: string) {
    if (isDemoMode) {
      return []
    }

    const { data, error } = await supabase!
      .from('responses')
      .select(`
        *,
        donor:users!responses_donor_id_fkey(*)
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },
}

// Locations service
export const locationsService = {
  async create(locationData: any) {
    if (isDemoMode) {
      console.log('✅ Demo: создана локация', locationData)
      return { id: 'demo-location-new', ...locationData }
    }

    const { data, error } = await supabase!
      .from('locations')
      .insert(locationData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    if (isDemoMode) {
      console.log('✅ Demo: обновлена локация', id, updates)
      return { id, ...updates }
    }

    const { data, error } = await supabase!
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// Users service (for profiles, stats, etc.)
export const usersService = {
  async getProfile(userId: string) {
    if (isDemoMode) {
      return mockUsers.find((u) => u.id === userId) || getMockAuthUser()
    }

    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: any) {
    if (isDemoMode) {
      console.log('✅ Demo: обновлен профиль', userId, updates)
      const user = { ...getMockAuthUser(), ...updates }
      setMockAuthUser(user as any)
      localStorage.setItem('demo_user', JSON.stringify(user))
      return user
    }

    const { data, error } = await supabase!
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getTopVolunteers(limit: number = 10) {
    if (isDemoMode) {
      return mockVolunteers.slice(0, limit)
    }

    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('role', 'volunteer')
      .order('rating', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },
}

// Donor offers service
export const donorOffersService = {
  async getAll(filters?: any) {
    if (isDemoMode) {
      let data = [...mockDonorOffers]

      if (filters?.type) {
        data = data.filter((o) => o.type === filters.type)
      }
      if (filters?.category) {
        data = data.filter((o) => o.category === filters.category)
      }
      if (filters?.status) {
        data = data.filter((o) => o.status === filters.status)
      }

      return data
    }

    let query = supabase!
      .from('donor_offers')
      .select(`
        *,
        donor:users!donor_offers_donor_id_fkey(*),
        location:locations(*)
      `)
      .order('created_at', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id: string) {
    if (isDemoMode) {
      return mockDonorOffers.find((o) => o.id === id) || null
    }

    const { data, error } = await supabase!
      .from('donor_offers')
      .select(`
        *,
        donor:users!donor_offers_donor_id_fkey(*),
        location:locations(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(offerData: any) {
    if (isDemoMode) {
      console.log('✅ Demo: создано объявление', offerData)
      return { id: 'demo-offer-new', ...offerData, created_at: new Date().toISOString() }
    }

    const { data, error } = await supabase!
      .from('donor_offers')
      .insert(offerData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    if (isDemoMode) {
      console.log('✅ Demo: обновлено объявление', id, updates)
      return { id, ...updates }
    }

    const { data, error } = await supabase!
      .from('donor_offers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    if (isDemoMode) {
      console.log('✅ Demo: удалено объявление', id)
      return
    }

    const { error } = await supabase!
      .from('donor_offers')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

// Storage service for file uploads
export const storageService = {
  async uploadFile(bucket: string, path: string, file: File) {
    if (isDemoMode) {
      console.log('✅ Demo: загружен файл', bucket, path, file.name)
      return { path: `demo/${path}` } as any
    }

    const { data, error } = await supabase!.storage
      .from(bucket)
      .upload(path, file)

    if (error) throw error
    return data
  },

  async getPublicUrl(bucket: string, path: string) {
    if (isDemoMode) {
      return `https://via.placeholder.com/400x300?text=${encodeURIComponent(path)}`
    }

    const { data } = supabase!.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  },

  async deleteFile(bucket: string, path: string) {
    if (isDemoMode) {
      console.log('✅ Demo: удален файл', bucket, path)
      return
    }

    const { error } = await supabase!.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
  },
}
