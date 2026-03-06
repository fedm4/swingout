// Manually authored types matching the schema in supabase/migrations/0001_initial_schema.sql
// To regenerate after connecting to Supabase:
//   npx supabase gen types typescript --project-id <id> > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AttendeeStatus = 'going' | 'interested'
export type GroupType = 'transport' | 'accommodation' | 'general'
export type MemberRole = 'admin' | 'member'
export type ChannelType = 'event' | 'group'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          venue: string | null
          city: string | null
          country: string | null
          start_date: string | null
          end_date: string | null
          website: string | null
          cover_url: string | null
          prices: Json
          classes_info: string | null
          is_published: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          venue?: string | null
          city?: string | null
          country?: string | null
          start_date?: string | null
          end_date?: string | null
          website?: string | null
          cover_url?: string | null
          prices?: Json
          classes_info?: string | null
          is_published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          venue?: string | null
          city?: string | null
          country?: string | null
          start_date?: string | null
          end_date?: string | null
          website?: string | null
          cover_url?: string | null
          prices?: Json
          classes_info?: string | null
          is_published?: boolean
          created_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: AttendeeStatus
          has_ticket: boolean | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: AttendeeStatus
          has_ticket?: boolean | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: AttendeeStatus
          has_ticket?: boolean | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          type: GroupType
          event_id: string | null
          created_by: string | null
          max_members: number | null
          is_open: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type?: GroupType
          event_id?: string | null
          created_by?: string | null
          max_members?: number | null
          is_open?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: GroupType
          event_id?: string | null
          created_by?: string | null
          max_members?: number | null
          is_open?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: MemberRole
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: MemberRole
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: MemberRole
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          content: string
          user_id: string
          channel_type: ChannelType
          channel_id: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          channel_type: ChannelType
          channel_id: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          channel_type?: ChannelType
          channel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      transport_offers: {
        Row: {
          id: string
          group_id: string
          user_id: string
          origin: string
          seats_available: number
          departure_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          origin: string
          seats_available?: number
          departure_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          origin?: string
          seats_available?: number
          departure_time?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_offers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_offers_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          }
        ]
      }
      accommodation_offers: {
        Row: {
          id: string
          group_id: string
          user_id: string
          address: string
          beds_available: number
          price_per_night: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          address: string
          beds_available?: number
          price_per_night?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          address?: string
          beds_available?: number
          price_per_night?: number | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_offers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodation_offers_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      attendee_status: AttendeeStatus
      group_type: GroupType
      member_role: MemberRole
      channel_type: ChannelType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Named row types
export type Profile = Tables<'profiles'>
export type Event = Tables<'events'>
export type EventAttendee = Tables<'event_attendees'>
export type Group = Tables<'groups'>
export type GroupMember = Tables<'group_members'>
export type Message = Tables<'messages'>
export type TransportOffer = Tables<'transport_offers'>
export type AccommodationOffer = Tables<'accommodation_offers'>

// Enriched types (with joins)
export type MessageWithProfile = Message & {
  profiles: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'>
}

export type EventWithAttendeeCount = Event & {
  attendee_count?: number
}

export type GroupWithMemberCount = Group & {
  member_count?: number
}

// Price entry in events.prices JSON
export interface PriceEntry {
  type: string
  amount: number
  currency?: string
}
