import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Auth service
export const authService = {
  async signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Help requests service
export const requestsService = {
  async getAll(filters?: any) {
    let query = supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('help_requests')
      .insert(requestData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('help_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('help_requests')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

// Shelters service
export const sheltersService = {
  async getAll(filters?: any) {
    let query = supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('shelters')
      .insert(shelterData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('responses')
      .insert(responseData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('responses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByRequestId(requestId: string) {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('locations')
      .insert(locationData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getTopVolunteers(limit: number = 10) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'volunteer')
      .order('rating', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },
}

// Storage service for file uploads
export const storageService = {
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)

    if (error) throw error
    return data
  },

  async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  },

  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
  },
}
