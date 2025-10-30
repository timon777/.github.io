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

// Responses service
export const responsesService = {
  async getAll(filters?: { request_id?: string; donor_id?: string; status?: string }) {
    if (isDemoMode) {
      console.log('✅ Demo: получение откликов', filters)
      return []
    }

    let query = supabase!
      .from('responses')
      .select(`
        *,
        request:help_requests(*,
          beneficiary:users(*),
          location:locations(*)
        ),
        donor:users(*),
        offered_items(*)
      `)
      .order('created_at', { ascending: false })

    if (filters?.request_id) {
      query = query.eq('request_id', filters.request_id)
    }
    if (filters?.donor_id) {
      query = query.eq('donor_id', filters.donor_id)
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
      console.log('✅ Demo: получение отклика', id)
      return null
    }

    const { data, error } = await supabase!
      .from('responses')
      .select(`
        *,
        request:help_requests(*,
          beneficiary:users(*),
          location:locations(*)
        ),
        donor:users(*),
        offered_items(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(responseData: {
    request_id: string
    donor_id: string
    message: string
    offered_items?: Array<{ name: string; quantity: number; unit: string }>
  }) {
    if (isDemoMode) {
      console.log('✅ Demo: создание отклика', responseData)
      return { id: 'demo-response-' + Date.now() } as any
    }

    // Create response
    const { data: response, error: responseError } = await supabase!
      .from('responses')
      .insert({
        request_id: responseData.request_id,
        donor_id: responseData.donor_id,
        message: responseData.message,
        status: 'pending',
      })
      .select()
      .single()

    if (responseError) throw responseError

    // Create offered items if provided
    if (responseData.offered_items && responseData.offered_items.length > 0) {
      const offeredItems = responseData.offered_items.map((item) => ({
        response_id: response.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      }))

      const { error: itemsError } = await supabase!
        .from('offered_items')
        .insert(offeredItems)

      if (itemsError) throw itemsError
    }

    return response
  },

  async updateStatus(id: string, status: 'pending' | 'accepted' | 'rejected') {
    if (isDemoMode) {
      console.log('✅ Demo: обновление статуса отклика', id, status)
      return
    }

    const { error } = await supabase!
      .from('responses')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  async delete(id: string) {
    if (isDemoMode) {
      console.log('✅ Demo: удаление отклика', id)
      return
    }

    const { error } = await supabase!
      .from('responses')
      .delete()
      .eq('id', id)

    if (error) throw error
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

  async uploadImage(file: File, folder: 'users' | 'requests' | 'offers' | 'messages') {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { data, error } = await this.uploadFile('images', filePath, file)
    if (error) throw error

    const publicUrl = await this.getPublicUrl('images', filePath)
    return { path: filePath, url: publicUrl }
  },
}

// Notifications service (Этап 1)
export const notificationsService = {
  async getAll(userId: string) {
    if (isDemoMode) {
      console.log('✅ Demo: получение уведомлений', userId)
      return []
    }

    const { data, error } = await supabase!
      .from('notifications')
      .select(`
        *,
        from_user:users!notifications_from_user_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getUnreadCount(userId: string) {
    if (isDemoMode) {
      console.log('✅ Demo: получение количества непрочитанных', userId)
      return 0
    }

    const { count, error } = await supabase!
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
    return count || 0
  },

  async markAsRead(notificationId: string) {
    if (isDemoMode) {
      console.log('✅ Demo: уведомление прочитано', notificationId)
      return
    }

    const { error } = await supabase!
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) throw error
  },

  async markAllAsRead(userId: string) {
    if (isDemoMode) {
      console.log('✅ Demo: все уведомления прочитаны', userId)
      return
    }

    const { error } = await supabase!
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
  },

  async delete(notificationId: string) {
    if (isDemoMode) {
      console.log('✅ Demo: удалено уведомление', notificationId)
      return
    }

    const { error } = await supabase!
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    if (isDemoMode) {
      console.log('✅ Demo: подписка на уведомления', userId)
      return { unsubscribe: () => {} }
    }

    const channel = supabase!
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new)
        }
      )
      .subscribe()

    return {
      unsubscribe: () => {
        supabase!.removeChannel(channel)
      },
    }
  },
}

// Messages service (Этап 1)
export const messagesService = {
  // Get all chats for a user
  async getChats(userId: string) {
    if (isDemoMode) {
      console.log('✅ Demo: получение чатов', userId)
      return []
    }

    const { data, error } = await supabase!
      .from('chats')
      .select(`
        *,
        user1:users!chats_user1_id_fkey(*),
        user2:users!chats_user2_id_fkey(*),
        request:help_requests(*),
        offer:donor_offers(*)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get or create a chat between two users
  async getOrCreateChat(user1Id: string, user2Id: string, context?: { requestId?: string; offerId?: string }) {
    if (isDemoMode) {
      console.log('✅ Demo: получение/создание чата', user1Id, user2Id)
      return { id: 'demo-chat-1', user1_id: user1Id, user2_id: user2Id }
    }

    // Sort user IDs to maintain the constraint user1_id < user2_id
    const [userId1, userId2] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id]

    // Try to find existing chat
    const { data: existingChat, error: findError } = await supabase!
      .from('chats')
      .select('*')
      .eq('user1_id', userId1)
      .eq('user2_id', userId2)
      .single()

    if (existingChat) {
      return existingChat
    }

    // Create new chat if not found
    const { data: newChat, error: createError } = await supabase!
      .from('chats')
      .insert({
        user1_id: userId1,
        user2_id: userId2,
        request_id: context?.requestId,
        offer_id: context?.offerId,
      })
      .select()
      .single()

    if (createError) throw createError
    return newChat
  },

  // Get messages for a chat
  async getMessages(chatId: string, limit: number = 50) {
    if (isDemoMode) {
      console.log('✅ Demo: получение сообщений', chatId)
      return []
    }

    const { data, error } = await supabase!
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(*)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Send a message
  async sendMessage(chatId: string, senderId: string, content: string, attachments?: string[]) {
    if (isDemoMode) {
      console.log('✅ Demo: отправка сообщения', chatId, content)
      return { id: 'demo-message-' + Date.now() }
    }

    const { data, error } = await supabase!
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content,
        attachments,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string) {
    if (isDemoMode) {
      console.log('✅ Demo: сообщения прочитаны', chatId, userId)
      return
    }

    const { error } = await supabase!
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .neq('sender_id', userId)
      .eq('read', false)

    if (error) throw error
  },

  // Get unread message count
  async getUnreadCount(userId: string) {
    if (isDemoMode) {
      console.log('✅ Demo: получение количества непрочитанных сообщений', userId)
      return 0
    }

    // Get all chats for this user
    const { data: chats } = await supabase!
      .from('chats')
      .select('id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

    if (!chats || chats.length === 0) return 0

    const chatIds = chats.map(c => c.id)

    // Count unread messages in these chats (not sent by this user)
    const { count, error } = await supabase!
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('chat_id', chatIds)
      .neq('sender_id', userId)
      .eq('read', false)

    if (error) throw error
    return count || 0
  },

  // Subscribe to new messages in a chat
  subscribeToMessages(chatId: string, callback: (message: any) => void) {
    if (isDemoMode) {
      console.log('✅ Demo: подписка на сообщения', chatId)
      return { unsubscribe: () => {} }
    }

    const channel = supabase!
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          callback(payload.new)
        }
      )
      .subscribe()

    return {
      unsubscribe: () => {
        supabase!.removeChannel(channel)
      },
    }
  },

  // Subscribe to chat updates (for chat list)
  subscribeToChats(userId: string, callback: (chat: any) => void) {
    if (isDemoMode) {
      console.log('✅ Demo: подписка на обновления чатов', userId)
      return { unsubscribe: () => {} }
    }

    const channel = supabase!
      .channel('chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
        },
        (payload) => {
          // Only notify if this user is part of the chat
          const chat = payload.new as any
          if (chat.user1_id === userId || chat.user2_id === userId) {
            callback(chat)
          }
        }
      )
      .subscribe()

    return {
      unsubscribe: () => {
        supabase!.removeChannel(channel)
      },
    }
  },
}
