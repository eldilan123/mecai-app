/**
 * Tipos de la base de datos de MecAI.
 *
 * ⚠️ AUTORADO A MANO (HU-04), fiel al esquema de `supabase/migrations/`.
 * Normalmente esto lo genera el Supabase CLI:
 *     npx supabase gen types typescript --linked > src/types/database.types.ts
 * pero ese comando requiere Docker (introspección local) o un ACCESS TOKEN del
 * CLI, ninguno disponible en el entorno actual. Regenerar con el comando de
 * arriba cuando estén disponibles, para mantener 100% de fidelidad.
 *
 * Nota: las columnas con CHECK (subscription_tier, type, category, status, etc.)
 * el CLI las tipa como `string` — se replica ese comportamiento aquí.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string
          avatar_url: string | null
          subscription_tier: string
          subscription_expires_at: string | null
          revenuecat_customer_id: string | null
          monthly_ai_queries_used: number
          monthly_queries_reset_at: string
          notifications_enabled: boolean
          notification_prefs: Json
          acquisition_source: string | null
          school_partner_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email: string
          avatar_url?: string | null
          subscription_tier?: string
          subscription_expires_at?: string | null
          revenuecat_customer_id?: string | null
          monthly_ai_queries_used?: number
          monthly_queries_reset_at?: string
          notifications_enabled?: boolean
          notification_prefs?: Json
          acquisition_source?: string | null
          school_partner_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string
          avatar_url?: string | null
          subscription_tier?: string
          subscription_expires_at?: string | null
          revenuecat_customer_id?: string | null
          monthly_ai_queries_used?: number
          monthly_queries_reset_at?: string
          notifications_enabled?: boolean
          notification_prefs?: Json
          acquisition_source?: string | null
          school_partner_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          id: string
          user_id: string
          type: string
          brand: string
          model: string
          year: number
          trim: string | null
          license_plate: string | null
          vin: string | null
          color: string | null
          nickname: string | null
          current_km: number
          km_updated_at: string
          photo_url: string | null
          is_active: boolean
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          brand: string
          model: string
          year: number
          trim?: string | null
          license_plate?: string | null
          vin?: string | null
          color?: string | null
          nickname?: string | null
          current_km: number
          km_updated_at?: string
          photo_url?: string | null
          is_active?: boolean
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          brand?: string
          model?: string
          year?: number
          trim?: string | null
          license_plate?: string | null
          vin?: string | null
          color?: string | null
          nickname?: string | null
          current_km?: number
          km_updated_at?: string
          photo_url?: string | null
          is_active?: boolean
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'vehicles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      maintenance_types: {
        Row: {
          id: string
          slug: string
          name_es: string
          name_en: string | null
          description_es: string | null
          category: string
          default_interval_km: number | null
          default_interval_months: number | null
          urgency_level: string
          applicable_to: string[]
          icon_name: string | null
          color_hint: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name_es: string
          name_en?: string | null
          description_es?: string | null
          category: string
          default_interval_km?: number | null
          default_interval_months?: number | null
          urgency_level?: string
          applicable_to?: string[]
          icon_name?: string | null
          color_hint?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name_es?: string
          name_en?: string | null
          description_es?: string | null
          category?: string
          default_interval_km?: number | null
          default_interval_months?: number | null
          urgency_level?: string
          applicable_to?: string[]
          icon_name?: string | null
          color_hint?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      maintenance_records: {
        Row: {
          id: string
          vehicle_id: string
          user_id: string
          maintenance_type_id: string | null
          name: string
          performed_at: string
          km_at_service: number | null
          cost_amount: number | null
          cost_currency: string
          workshop_name: string | null
          workshop_city: string | null
          workshop_notes: string | null
          notes: string | null
          photos: string[] | null
          source: string
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          user_id: string
          maintenance_type_id?: string | null
          name: string
          performed_at: string
          km_at_service?: number | null
          cost_amount?: number | null
          cost_currency?: string
          workshop_name?: string | null
          workshop_city?: string | null
          workshop_notes?: string | null
          notes?: string | null
          photos?: string[] | null
          source?: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          user_id?: string
          maintenance_type_id?: string | null
          name?: string
          performed_at?: string
          km_at_service?: number | null
          cost_amount?: number | null
          cost_currency?: string
          workshop_name?: string | null
          workshop_city?: string | null
          workshop_notes?: string | null
          notes?: string | null
          photos?: string[] | null
          source?: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'maintenance_records_vehicle_id_fkey'
            columns: ['vehicle_id']
            isOneToOne: false
            referencedRelation: 'vehicles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'maintenance_records_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'maintenance_records_maintenance_type_id_fkey'
            columns: ['maintenance_type_id']
            isOneToOne: false
            referencedRelation: 'maintenance_types'
            referencedColumns: ['id']
          },
        ]
      }
      maintenance_schedules: {
        Row: {
          id: string
          vehicle_id: string
          user_id: string
          maintenance_type_id: string
          due_date: string | null
          due_km: number | null
          status: string
          last_record_id: string | null
          notified_two_weeks: boolean
          notified_three_days: boolean
          notified_day_of: boolean
          last_calculated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          user_id: string
          maintenance_type_id: string
          due_date?: string | null
          due_km?: number | null
          status?: string
          last_record_id?: string | null
          notified_two_weeks?: boolean
          notified_three_days?: boolean
          notified_day_of?: boolean
          last_calculated_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          user_id?: string
          maintenance_type_id?: string
          due_date?: string | null
          due_km?: number | null
          status?: string
          last_record_id?: string | null
          notified_two_weeks?: boolean
          notified_three_days?: boolean
          notified_day_of?: boolean
          last_calculated_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'maintenance_schedules_vehicle_id_fkey'
            columns: ['vehicle_id']
            isOneToOne: false
            referencedRelation: 'vehicles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'maintenance_schedules_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'maintenance_schedules_maintenance_type_id_fkey'
            columns: ['maintenance_type_id']
            isOneToOne: false
            referencedRelation: 'maintenance_types'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'maintenance_schedules_last_record_id_fkey'
            columns: ['last_record_id']
            isOneToOne: false
            referencedRelation: 'maintenance_records'
            referencedColumns: ['id']
          },
        ]
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string | null
          type: string
          title: string | null
          messages: Json
          query_count: number
          was_useful: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id?: string | null
          type?: string
          title?: string | null
          messages?: Json
          query_count?: number
          was_useful?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_id?: string | null
          type?: string
          title?: string | null
          messages?: Json
          query_count?: number
          was_useful?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_conversations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ai_conversations_vehicle_id_fkey'
            columns: ['vehicle_id']
            isOneToOne: false
            referencedRelation: 'vehicles'
            referencedColumns: ['id']
          },
        ]
      }
      school_partners: {
        Row: {
          id: string
          name: string
          city: string
          contact_name: string | null
          contact_email: string | null
          contact_phone: string | null
          promo_code: string
          premium_days: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          city: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          promo_code: string
          premium_days?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          promo_code?: string
          premium_days?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update']
