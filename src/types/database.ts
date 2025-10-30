export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          role: 'beneficiary' | 'donor' | 'volunteer' | 'shelter' | 'ngo' | 'admin'
          avatar: string | null
          rating: number | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: 'beneficiary' | 'donor' | 'volunteer' | 'shelter' | 'ngo' | 'admin'
          avatar?: string | null
          rating?: number | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: 'beneficiary' | 'donor' | 'volunteer' | 'shelter' | 'ngo' | 'admin'
          avatar?: string | null
          rating?: number | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          address: string
          city: string
          region: string
          country: string
          latitude: number
          longitude: number
          created_at: string
        }
        Insert: {
          id?: string
          address: string
          city: string
          region: string
          country?: string
          latitude: number
          longitude: number
          created_at?: string
        }
        Update: {
          id?: string
          address?: string
          city?: string
          region?: string
          country?: string
          latitude?: number
          longitude?: number
          created_at?: string
        }
      }
      help_requests: {
        Row: {
          id: string
          title: string
          description: string
          category: 'food' | 'clothing' | 'medicine' | 'household' | 'construction' | 'transport' | 'medical_service' | 'legal_service' | 'psychological_service' | 'animal_care'
          status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          beneficiary_id: string
          location_id: string
          images: string[] | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: 'food' | 'clothing' | 'medicine' | 'household' | 'construction' | 'transport' | 'medical_service' | 'legal_service' | 'psychological_service' | 'animal_care'
          status?: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          beneficiary_id: string
          location_id: string
          images?: string[] | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: 'food' | 'clothing' | 'medicine' | 'household' | 'construction' | 'transport' | 'medical_service' | 'legal_service' | 'psychological_service' | 'animal_care'
          status?: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          beneficiary_id?: string
          location_id?: string
          images?: string[] | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      shelters: {
        Row: {
          id: string
          name: string
          description: string
          type: 'animal' | 'human'
          location_id: string
          contact_email: string
          contact_phone: string
          images: string[] | null
          verified: boolean
          rating: number | null
          manager_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          type: 'animal' | 'human'
          location_id: string
          contact_email: string
          contact_phone: string
          images?: string[] | null
          verified?: boolean
          rating?: number | null
          manager_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          type?: 'animal' | 'human'
          location_id?: string
          contact_email?: string
          contact_phone?: string
          images?: string[] | null
          verified?: boolean
          rating?: number | null
          manager_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      responses: {
        Row: {
          id: string
          request_id: string
          donor_id: string
          message: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id: string
          donor_id: string
          message: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          donor_id?: string
          message?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          icon: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          icon: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          icon?: string
          earned_at?: string
        }
      }
      emergencies: {
        Row: {
          id: string
          title: string
          description: string
          type: 'natural_disaster' | 'accident' | 'evacuation'
          location_id: string
          active: boolean
          priority_boost: number
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: 'natural_disaster' | 'accident' | 'evacuation'
          location_id: string
          active?: boolean
          priority_boost?: number
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: 'natural_disaster' | 'accident' | 'evacuation'
          location_id?: string
          active?: boolean
          priority_boost?: number
          created_at?: string
          resolved_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'response_received' | 'response_accepted' | 'response_rejected' | 'request_status_changed' | 'offer_status_changed' | 'new_message' | 'request_matched' | 'offer_matched' | 'verification_approved' | 'verification_rejected' | 'system'
          title: string
          message: string
          link: string | null
          read: boolean
          request_id: string | null
          offer_id: string | null
          response_id: string | null
          from_user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'response_received' | 'response_accepted' | 'response_rejected' | 'request_status_changed' | 'offer_status_changed' | 'new_message' | 'request_matched' | 'offer_matched' | 'verification_approved' | 'verification_rejected' | 'system'
          title: string
          message: string
          link?: string | null
          read?: boolean
          request_id?: string | null
          offer_id?: string | null
          response_id?: string | null
          from_user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'response_received' | 'response_accepted' | 'response_rejected' | 'request_status_changed' | 'offer_status_changed' | 'new_message' | 'request_matched' | 'offer_matched' | 'verification_approved' | 'verification_rejected' | 'system'
          title?: string
          message?: string
          link?: string | null
          read?: boolean
          request_id?: string | null
          offer_id?: string | null
          response_id?: string | null
          from_user_id?: string | null
          created_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          request_id: string | null
          offer_id: string | null
          last_message_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          request_id?: string | null
          offer_id?: string | null
          last_message_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          request_id?: string | null
          offer_id?: string | null
          last_message_at?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string
          read: boolean
          attachments: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content: string
          read?: boolean
          attachments?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string
          read?: boolean
          attachments?: string[] | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
