// User roles
export type UserRole = 'beneficiary' | 'donor' | 'volunteer' | 'shelter' | 'ngo' | 'admin'

// User types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  phone?: string
  avatar?: string
  rating?: number
  verified: boolean
  location?: Location
  created_at: string
}

// Location
export interface Location {
  id: string
  address: string
  city: string
  region: string
  country: string
  latitude: number
  longitude: number
}

// Help request categories
export type HelpCategory =
  | 'food'
  | 'clothing'
  | 'medicine'
  | 'household'
  | 'construction'
  | 'transport'
  | 'medical_service'
  | 'legal_service'
  | 'psychological_service'
  | 'animal_care'

export type RequestStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

// Help request
export interface HelpRequest {
  id: string
  title: string
  description: string
  category: HelpCategory
  status: RequestStatus
  priority: Priority
  beneficiary: User
  location: Location
  images?: string[]
  needed_items?: NeededItem[]
  created_at: string
  updated_at: string
  completed_at?: string
  volunteers?: User[]
  responses?: Response[]
}

// Needed items
export interface NeededItem {
  id: string
  name: string
  quantity: number
  unit: string
  received: number
}

// Response to help request
export interface Response {
  id: string
  request: HelpRequest
  donor: User
  message: string
  items_offered?: OfferedItem[]
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface OfferedItem {
  id: string
  name: string
  quantity: number
  unit: string
}

// Shelter
export interface Shelter {
  id: string
  name: string
  description: string
  type: 'animal' | 'human'
  location: Location
  contact_email: string
  contact_phone: string
  images?: string[]
  needs?: NeededItem[]
  verified: boolean
  rating?: number
  manager: User
  created_at: string
}

// Volunteer achievement
export interface Achievement {
  id: string
  user: User
  title: string
  description: string
  icon: string
  earned_at: string
}

// Statistics
export interface UserStats {
  user_id: string
  requests_created: number
  requests_completed: number
  donations_made: number
  volunteer_hours: number
  rating: number
  achievements: Achievement[]
}

// Emergency mode
export interface Emergency {
  id: string
  title: string
  description: string
  type: 'natural_disaster' | 'accident' | 'evacuation'
  location: Location
  active: boolean
  priority_boost: number
  created_at: string
  resolved_at?: string
}
