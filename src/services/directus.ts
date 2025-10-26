import { createDirectus, rest, authentication, readItems, createItem, updateItem, deleteItem } from '@directus/sdk'

// Define your Directus schema
interface Schema {
  users: any[]
  help_requests: any[]
  responses: any[]
  shelters: any[]
  locations: any[]
  achievements: any[]
  emergencies: any[]
}

// Directus instance
const directusUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'

export const directus = createDirectus<Schema>(directusUrl)
  .with(rest())
  .with(authentication('json'))

// Auth functions
export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await directus.login(email, password)
      return response
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  async register(email: string, password: string, userData: any) {
    try {
      const response = await directus.request(
        createItem('users', {
          email,
          password,
          ...userData,
        })
      )
      return response
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },

  async logout() {
    try {
      await directus.logout()
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },

  async getCurrentUser() {
    try {
      const user = await directus.request(readItems('users', {
        filter: { id: { _eq: '$CURRENT_USER' } },
        limit: 1,
      }))
      return user[0]
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },
}

// Help requests functions
export const requestsService = {
  async getAll(filters?: any) {
    return await directus.request(readItems('help_requests', filters))
  },

  async getById(id: string) {
    return await directus.request(readItems('help_requests', {
      filter: { id: { _eq: id } },
      limit: 1,
    }))
  },

  async create(data: any) {
    return await directus.request(createItem('help_requests', data))
  },

  async update(id: string, data: any) {
    return await directus.request(updateItem('help_requests', id, data))
  },

  async delete(id: string) {
    return await directus.request(deleteItem('help_requests', id))
  },
}

// Shelters functions
export const sheltersService = {
  async getAll(filters?: any) {
    return await directus.request(readItems('shelters', filters))
  },

  async getById(id: string) {
    return await directus.request(readItems('shelters', {
      filter: { id: { _eq: id } },
      limit: 1,
    }))
  },

  async create(data: any) {
    return await directus.request(createItem('shelters', data))
  },

  async update(id: string, data: any) {
    return await directus.request(updateItem('shelters', id, data))
  },
}

// Responses functions
export const responsesService = {
  async create(data: any) {
    return await directus.request(createItem('responses', data))
  },

  async update(id: string, data: any) {
    return await directus.request(updateItem('responses', id, data))
  },
}
