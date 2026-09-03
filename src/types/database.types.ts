export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      direct_bookings: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          preferred_date: string
          preferred_time_slot: string
          resident_id: string
          service_id: string
          society_id: string
          status: string
          updated_at: string | null
          worker_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          preferred_date: string
          preferred_time_slot: string
          resident_id: string
          service_id: string
          society_id: string
          status: string
          updated_at?: string | null
          worker_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          preferred_date?: string
          preferred_time_slot?: string
          resident_id?: string
          service_id?: string
          society_id?: string
          status?: string
          updated_at?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "direct_bookings_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_bookings_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_bookings_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      guarantee_claims: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          issue_type: string | null
          job_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          issue_type?: string | null
          job_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          issue_type?: string | null
          job_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guarantee_claims_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string | null
          direct_booking_id: string | null
          discount_amount: number | null
          flat_no: string | null
          guarantee_expires_at: string | null
          id: string
          labour_amount: number | null
          requested_time: string | null
          resident_id: string | null
          resident_photo_evidence: string | null
          service_visit_id: string | null
          status: string | null
          total_amount: number | null
        }
        Insert: {
          created_at?: string | null
          direct_booking_id?: string | null
          discount_amount?: number | null
          flat_no?: string | null
          guarantee_expires_at?: string | null
          id?: string
          labour_amount?: number | null
          requested_time?: string | null
          resident_id?: string | null
          resident_photo_evidence?: string | null
          service_visit_id?: string | null
          status?: string | null
          total_amount?: number | null
        }
        Update: {
          created_at?: string | null
          direct_booking_id?: string | null
          discount_amount?: number | null
          flat_no?: string | null
          guarantee_expires_at?: string | null
          id?: string
          labour_amount?: number | null
          requested_time?: string | null
          resident_id?: string | null
          resident_photo_evidence?: string | null
          service_visit_id?: string | null
          status?: string | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_direct_booking_id_fkey"
            columns: ["direct_booking_id"]
            isOneToOne: false
            referencedRelation: "direct_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_service_visit_id_fkey"
            columns: ["service_visit_id"]
            isOneToOne: false
            referencedRelation: "service_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          customer_approved: boolean | null
          id: string
          job_id: string | null
          name: string
          qty: number
          unit_price: number
        }
        Insert: {
          customer_approved?: boolean | null
          id?: string
          job_id?: string | null
          name: string
          qty: number
          unit_price: number
        }
        Update: {
          customer_approved?: boolean | null
          id?: string
          job_id?: string | null
          name?: string
          qty?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "materials_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_tiers: {
        Row: {
          id: string
          label: string | null
          max_participants: number
          min_participants: number
          price: number
          service_visit_id: string | null
        }
        Insert: {
          id?: string
          label?: string | null
          max_participants: number
          min_participants: number
          price: number
          service_visit_id?: string | null
        }
        Update: {
          id?: string
          label?: string | null
          max_participants?: number
          min_participants?: number
          price?: number
          service_visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_tiers_service_visit_id_fkey"
            columns: ["service_visit_id"]
            isOneToOne: false
            referencedRelation: "service_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          created_at: string | null
          customer_id: string | null
          feedback: string | null
          id: string
          job_id: string | null
          rating: number
          worker_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          feedback?: string | null
          id?: string
          job_id?: string | null
          rating: number
          worker_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          feedback?: string | null
          id?: string
          job_id?: string | null
          rating?: number
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_visits: {
        Row: {
          capacity: number
          created_at: string | null
          created_by_staff_id: string | null
          date: string
          id: string
          service_id: string | null
          share_token: string
          society_id: string | null
          status: string | null
          time_window: string
          token_expires_at: string | null
          worker_id: string | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          created_by_staff_id?: string | null
          date: string
          id?: string
          service_id?: string | null
          share_token: string
          society_id?: string | null
          status?: string | null
          time_window: string
          token_expires_at?: string | null
          worker_id?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          created_by_staff_id?: string | null
          date?: string
          id?: string
          service_id?: string | null
          share_token?: string
          society_id?: string | null
          status?: string | null
          time_window?: string
          token_expires_at?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_visits_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_visits_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_visits_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_visits_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          title: string
        }
        Insert: {
          base_price?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
        }
        Update: {
          base_price?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      societies: {
        Row: {
          aadhaar_photo_url: string | null
          active_residents_count: number | null
          address: string
          city: string
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          pincode: string | null
          state: string
          total_flats: number | null
          verification_video_url: string | null
        }
        Insert: {
          aadhaar_photo_url?: string | null
          active_residents_count?: number | null
          address: string
          city: string
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name: string
          pincode?: string | null
          state: string
          total_flats?: number | null
          verification_video_url?: string | null
        }
        Update: {
          aadhaar_photo_url?: string | null
          active_residents_count?: number | null
          address?: string
          city?: string
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string
          pincode?: string | null
          state?: string
          total_flats?: number | null
          verification_video_url?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          flat_no: string | null
          id: string
          name: string
          phone: string | null
          role: string
          society_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          flat_no?: string | null
          id: string
          name: string
          phone?: string | null
          role: string
          society_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          flat_no?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string
          society_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_society"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      welfare_coverage: {
        Row: {
          accident_cover: boolean | null
          created_at: string | null
          expiry_date: string
          family_addon: boolean | null
          id: string
          policy_no: string
          provider: string
          status: string | null
          sum_insured: number
          telehealth_eligible: boolean | null
          worker_id: string | null
        }
        Insert: {
          accident_cover?: boolean | null
          created_at?: string | null
          expiry_date: string
          family_addon?: boolean | null
          id?: string
          policy_no: string
          provider: string
          status?: string | null
          sum_insured: number
          telehealth_eligible?: boolean | null
          worker_id?: string | null
        }
        Update: {
          accident_cover?: boolean | null
          created_at?: string | null
          expiry_date?: string
          family_addon?: boolean | null
          id?: string
          policy_no?: string
          provider?: string
          status?: string | null
          sum_insured?: number
          telehealth_eligible?: boolean | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "welfare_coverage_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_skills: {
        Row: {
          certified: boolean | null
          id: string
          skill_name: string
          worker_id: string | null
        }
        Insert: {
          certified?: boolean | null
          id?: string
          skill_name: string
          worker_id?: string | null
        }
        Update: {
          certified?: boolean | null
          id?: string
          skill_name?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_skills_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          aadhaar_photo_url: string | null
          available_balance: number | null
          cooperative_name: string | null
          created_at: string | null
          id: string
          identity_verified: boolean | null
          is_online: boolean | null
          police_verification_verified: boolean | null
          ppe_compliance: boolean | null
          rating: number | null
          removed_at: string | null
          total_jobs: number | null
          user_id: string | null
          verification_status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED' | 'REUPLOAD_REQUESTED' | null
          verification_video_url: string | null
        }
        Insert: {
          aadhaar_photo_url?: string | null
          available_balance?: number | null
          cooperative_name?: string | null
          created_at?: string | null
          id?: string
          identity_verified?: boolean | null
          is_online?: boolean | null
          police_verification_verified?: boolean | null
          ppe_compliance?: boolean | null
          rating?: number | null
          removed_at?: string | null
          total_jobs?: number | null
          user_id?: string | null
          verification_status?: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED' | 'REUPLOAD_REQUESTED' | null
          verification_video_url?: string | null
        }
        Update: {
          aadhaar_photo_url?: string | null
          available_balance?: number | null
          cooperative_name?: string | null
          created_at?: string | null
          id?: string
          identity_verified?: boolean | null
          is_online?: boolean | null
          police_verification_verified?: boolean | null
          ppe_compliance?: boolean | null
          rating?: number | null
          removed_at?: string | null
          total_jobs?: number | null
          user_id?: string | null
          verification_status?: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED' | 'REUPLOAD_REQUESTED' | null
          verification_video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_service_visit_with_tiers: {
        Args: {
          p_capacity: number
          p_date: string
          p_service_id: string
          p_share_token: string
          p_society_id: string
          p_staff_id: string
          p_tiers: Json
          p_time_window: string
          p_worker_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

