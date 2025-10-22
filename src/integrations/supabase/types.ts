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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          new_data: Json | null
          previous_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          new_data?: Json | null
          previous_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          new_data?: Json | null
          previous_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      calendar_integrations: {
        Row: {
          access_token: string | null
          calendar_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      checklist_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          estimated_time: number | null
          id: string
          items: Json
          job_type: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          estimated_time?: number | null
          id?: string
          items?: Json
          job_type: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          estimated_time?: number | null
          id?: string
          items?: Json
          job_type?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      checklists: {
        Row: {
          created_at: string
          estimated_time: number | null
          id: string
          items: Json
          job_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_time?: number | null
          id?: string
          items?: Json
          job_id: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_time?: number | null
          id?: string
          items?: Json
          job_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      client_galleries: {
        Row: {
          access_instructions: string | null
          allow_selection: boolean | null
          created_at: string | null
          download_limit: number | null
          expiration_date: string | null
          gallery_links: Json | null
          id: string
          job_id: string
          name: string
          password_hash: string | null
          password_protected: boolean | null
          share_token: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          access_instructions?: string | null
          allow_selection?: boolean | null
          created_at?: string | null
          download_limit?: number | null
          expiration_date?: string | null
          gallery_links?: Json | null
          id?: string
          job_id: string
          name: string
          password_hash?: string | null
          password_protected?: boolean | null
          share_token?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          access_instructions?: string | null
          allow_selection?: boolean | null
          created_at?: string | null
          download_limit?: number | null
          expiration_date?: string | null
          gallery_links?: Json | null
          id?: string
          job_id?: string
          name?: string
          password_hash?: string | null
          password_protected?: boolean | null
          share_token?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_galleries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          email: string | null
          external_folder_link: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          preferences: Json | null
          tags: string[] | null
          type: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          external_folder_link?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          external_folder_link?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contract_templates: {
        Row: {
          cancellation_fee: number | null
          clauses: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          terms_text: string
          updated_at: string | null
        }
        Insert: {
          cancellation_fee?: number | null
          clauses?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          terms_text: string
          updated_at?: string | null
        }
        Update: {
          cancellation_fee?: number | null
          clauses?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          terms_text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          attachments_links: Json | null
          cancellation_fee: number | null
          cancellation_policy_text: string | null
          clauses: Json | null
          client_id: string
          copyright_notice: string | null
          created_at: string
          id: string
          issued_at: string | null
          job_id: string | null
          late_delivery_clause: string | null
          pdf_url: string | null
          reschedule_policy: string | null
          revision_policy: string | null
          signature_token: string | null
          signature_url: string | null
          signed_at: string | null
          status: Database["public"]["Enums"]["contract_status"]
          terms_text: string | null
          updated_at: string
          usage_rights_text: string | null
        }
        Insert: {
          attachments_links?: Json | null
          cancellation_fee?: number | null
          cancellation_policy_text?: string | null
          clauses?: Json | null
          client_id: string
          copyright_notice?: string | null
          created_at?: string
          id?: string
          issued_at?: string | null
          job_id?: string | null
          late_delivery_clause?: string | null
          pdf_url?: string | null
          reschedule_policy?: string | null
          revision_policy?: string | null
          signature_token?: string | null
          signature_url?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          terms_text?: string | null
          updated_at?: string
          usage_rights_text?: string | null
        }
        Update: {
          attachments_links?: Json | null
          cancellation_fee?: number | null
          cancellation_policy_text?: string | null
          clauses?: Json | null
          client_id?: string
          copyright_notice?: string | null
          created_at?: string
          id?: string
          issued_at?: string | null
          job_id?: string | null
          late_delivery_clause?: string | null
          pdf_url?: string | null
          reschedule_policy?: string | null
          revision_policy?: string | null
          signature_token?: string | null
          signature_url?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          terms_text?: string | null
          updated_at?: string
          usage_rights_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          access_instructions: string | null
          created_by: string | null
          downloaded_at: string | null
          external_platform: string | null
          file_name: string
          file_size: number | null
          file_url: string | null
          id: string
          job_id: string
          sent_to_client_at: string | null
          type: string
          uploaded_at: string | null
          version: string | null
        }
        Insert: {
          access_instructions?: string | null
          created_by?: string | null
          downloaded_at?: string | null
          external_platform?: string | null
          file_name: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          job_id: string
          sent_to_client_at?: string | null
          type: string
          uploaded_at?: string | null
          version?: string | null
        }
        Update: {
          access_instructions?: string | null
          created_by?: string | null
          downloaded_at?: string | null
          external_platform?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          job_id?: string
          sent_to_client_at?: string | null
          type?: string
          uploaded_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_photos: {
        Row: {
          client_downloaded_at: string | null
          client_selected: boolean | null
          created_at: string | null
          display_order: number | null
          external_url: string | null
          file_name: string
          file_size: number | null
          file_url: string | null
          gallery_id: string
          id: string
          item_id: string | null
          thumbnail_url: string | null
        }
        Insert: {
          client_downloaded_at?: string | null
          client_selected?: boolean | null
          created_at?: string | null
          display_order?: number | null
          external_url?: string | null
          file_name: string
          file_size?: number | null
          file_url?: string | null
          gallery_id: string
          id?: string
          item_id?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          client_downloaded_at?: string | null
          client_selected?: boolean | null
          created_at?: string | null
          display_order?: number | null
          external_url?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string | null
          gallery_id?: string
          id?: string
          item_id?: string | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "client_galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      job_resources: {
        Row: {
          created_at: string
          id: string
          job_id: string
          notes: string | null
          reserved_from: string
          reserved_until: string
          resource_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          notes?: string | null
          reserved_from: string
          reserved_until: string
          resource_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          notes?: string | null
          reserved_from?: string
          reserved_until?: string
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_resources_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      job_team_members: {
        Row: {
          assigned_at: string
          id: string
          job_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          job_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          job_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_team_members_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_datetime: string | null
          estimated_cost: number | null
          estimated_hours: number | null
          estimated_revenue: number | null
          external_assets_links: Json | null
          external_gallery_link: string | null
          google_calendar_event_id: string | null
          id: string
          location: string | null
          location_map_embed: string | null
          start_datetime: string
          status: Database["public"]["Enums"]["job_status"]
          tags: string[] | null
          time_spent: number | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_datetime?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          estimated_revenue?: number | null
          external_assets_links?: Json | null
          external_gallery_link?: string | null
          google_calendar_event_id?: string | null
          id?: string
          location?: string | null
          location_map_embed?: string | null
          start_datetime: string
          status?: Database["public"]["Enums"]["job_status"]
          tags?: string[] | null
          time_spent?: number | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_datetime?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          estimated_revenue?: number | null
          external_assets_links?: Json | null
          external_gallery_link?: string | null
          google_calendar_event_id?: string | null
          id?: string
          location?: string | null
          location_map_embed?: string | null
          start_datetime?: string
          status?: Database["public"]["Enums"]["job_status"]
          tags?: string[] | null
          time_spent?: number | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          notes: string | null
          probability: number | null
          responsible_id: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          probability?: number | null
          responsible_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          probability?: number | null
          responsible_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          delivered: boolean | null
          id: string
          payload: Json | null
          read: boolean | null
          recipient_id: string
          sent_at: string
          type: string
        }
        Insert: {
          created_at?: string
          delivered?: boolean | null
          id?: string
          payload?: Json | null
          read?: boolean | null
          recipient_id: string
          sent_at?: string
          type: string
        }
        Update: {
          created_at?: string
          delivered?: boolean | null
          id?: string
          payload?: Json | null
          read?: boolean | null
          recipient_id?: string
          sent_at?: string
          type?: string
        }
        Relationships: []
      }
      payment_plans: {
        Row: {
          created_at: string | null
          id: string
          installments: Json
          job_id: string | null
          quote_id: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          installments?: Json
          job_id?: string | null
          quote_id?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          installments?: Json
          job_id?: string | null
          quote_id?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_plans_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plans_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reminders: {
        Row: {
          email_sent: boolean | null
          id: string
          notification_sent: boolean | null
          payment_id: string
          sent_at: string | null
          type: string
        }
        Insert: {
          email_sent?: boolean | null
          id?: string
          notification_sent?: boolean | null
          payment_id: string
          sent_at?: string | null
          type: string
        }
        Update: {
          email_sent?: boolean | null
          id?: string
          notification_sent?: boolean | null
          payment_id?: string
          sent_at?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          currency: string | null
          due_date: string | null
          id: string
          method: string | null
          notes: string | null
          paid_at: string | null
          payment_plan_id: string | null
          quote_id: string | null
          receipt_link: string | null
          receipt_url: string | null
          status: Database["public"]["Enums"]["payment_status"]
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          currency?: string | null
          due_date?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_plan_id?: string | null
          quote_id?: string | null
          receipt_link?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          currency?: string | null
          due_date?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_plan_id?: string | null
          quote_id?: string | null
          receipt_link?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_plan_id_fkey"
            columns: ["payment_plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          currency: string | null
          discount: number | null
          id: string
          items: Json
          job_type: string
          name: string
          notes: string | null
          tax: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          discount?: number | null
          id?: string
          items?: Json
          job_type: string
          name: string
          notes?: string | null
          tax?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          discount?: number | null
          id?: string
          items?: Json
          job_type?: string
          name?: string
          notes?: string | null
          tax?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          accepted_at: string | null
          client_id: string
          converted_to_job_at: string | null
          created_at: string
          currency: string | null
          discount: number | null
          id: string
          items: Json
          job_id: string | null
          pdf_link: string | null
          status: Database["public"]["Enums"]["quote_status"]
          tax: number | null
          total: number
          updated_at: string
          validity_date: string | null
        }
        Insert: {
          accepted_at?: string | null
          client_id: string
          converted_to_job_at?: string | null
          created_at?: string
          currency?: string | null
          discount?: number | null
          id?: string
          items?: Json
          job_id?: string | null
          pdf_link?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          tax?: number | null
          total: number
          updated_at?: string
          validity_date?: string | null
        }
        Update: {
          accepted_at?: string | null
          client_id?: string
          converted_to_job_at?: string | null
          created_at?: string
          currency?: string | null
          discount?: number | null
          id?: string
          items?: Json
          job_id?: string | null
          pdf_link?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          tax?: number | null
          total?: number
          updated_at?: string
          validity_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string
          id: string
          location: string | null
          manual_link: string | null
          name: string
          next_maintenance_date: string | null
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          manual_link?: string | null
          name: string
          next_maintenance_date?: string | null
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          manual_link?: string | null
          name?: string
          next_maintenance_date?: string | null
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          created_at: string | null
          description: string | null
          entry_date: string
          hours: number
          id: string
          job_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entry_date: string
          hours: number
          id?: string
          job_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entry_date?: string
          hours?: number
          id?: string
          job_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "photographer" | "editor" | "assistant"
      contract_status: "draft" | "sent" | "signed" | "cancelled"
      job_status:
        | "scheduled"
        | "confirmed"
        | "in_production"
        | "delivery_pending"
        | "completed"
        | "cancelled"
      lead_status: "new" | "contacted" | "proposal_sent" | "won" | "lost"
      payment_status: "pending" | "partial" | "paid" | "refunded"
      quote_status: "draft" | "sent" | "accepted" | "rejected"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "photographer", "editor", "assistant"],
      contract_status: ["draft", "sent", "signed", "cancelled"],
      job_status: [
        "scheduled",
        "confirmed",
        "in_production",
        "delivery_pending",
        "completed",
        "cancelled",
      ],
      lead_status: ["new", "contacted", "proposal_sent", "won", "lost"],
      payment_status: ["pending", "partial", "paid", "refunded"],
      quote_status: ["draft", "sent", "accepted", "rejected"],
    },
  },
} as const
