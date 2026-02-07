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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      abandoned_checkouts: {
        Row: {
          amount: number | null
          created_at: string | null
          email: string
          id: string
          recovered: boolean | null
          recovered_at: string | null
          session_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          email: string
          id?: string
          recovered?: boolean | null
          recovered_at?: string | null
          session_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          email?: string
          id?: string
          recovered?: boolean | null
          recovered_at?: string | null
          session_id?: string
        }
        Relationships: []
      }
      admin_notes: {
        Row: {
          content: string
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content?: string
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: string
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          session_id: string | null
          url_path: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          session_id?: string | null
          url_path?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          session_id?: string | null
          url_path?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          is_rolled_back: boolean | null
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          is_rolled_back?: boolean | null
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          is_rolled_back?: boolean | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      calendar_entries: {
        Row: {
          caption_id: string | null
          content_item_id: string | null
          created_at: string | null
          day_of_year: number
          id: string
          notes: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          caption_id?: string | null
          content_item_id?: string | null
          created_at?: string | null
          day_of_year: number
          id?: string
          notes?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          caption_id?: string | null
          content_item_id?: string | null
          created_at?: string | null
          day_of_year?: number
          id?: string
          notes?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "calendar_entries_caption_id_fkey"
            columns: ["caption_id"]
            isOneToOne: false
            referencedRelation: "captions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_entries_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      captions: {
        Row: {
          category: string | null
          created_at: string
          destination: string
          display_order: number | null
          hashtags: string
          id: string
          is_active: boolean | null
          language: string | null
          text: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          destination: string
          display_order?: number | null
          hashtags: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          text: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          destination?: string
          display_order?: number | null
          hashtags?: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_clicks: {
        Row: {
          clicked_at: string
          content_id: string
          content_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          clicked_at?: string
          content_id: string
          content_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          clicked_at?: string
          content_id?: string
          content_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      content_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_highlighted: boolean | null
          is_new: boolean | null
          language: string | null
          media_type: string | null
          media_url: string | null
          subcategory: string | null
          title: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_highlighted?: boolean | null
          is_new?: boolean | null
          language?: string | null
          media_type?: string | null
          media_url?: string | null
          subcategory?: string | null
          title: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_highlighted?: boolean | null
          is_new?: boolean | null
          language?: string | null
          media_type?: string | null
          media_url?: string | null
          subcategory?: string | null
          title?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      email_events: {
        Row: {
          created_at: string
          email_id: string
          email_type: string | null
          id: string
          metadata: Json | null
          recipient_email: string | null
          type: string
        }
        Insert: {
          created_at?: string
          email_id: string
          email_type?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string | null
          type: string
        }
        Update: {
          created_at?: string
          email_id?: string
          email_type?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string | null
          type?: string
        }
        Relationships: []
      }
      magic_link_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          name: string | null
          phone: string | null
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          name?: string | null
          phone?: string | null
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      marketing_tools: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          language: string | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          language?: string | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          language?: string | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          id: string
          page_path: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          page_path: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          page_path?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_visit_at: string | null
          id: string
          language: string | null
          name: string | null
          phone: string | null
          referrer_url: string | null
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_visit_at?: string | null
          id?: string
          language?: string | null
          name?: string | null
          phone?: string | null
          referrer_url?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_visit_at?: string | null
          id?: string
          language?: string | null
          name?: string | null
          phone?: string | null
          referrer_url?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          product_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          traffic_source_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          traffic_source_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          traffic_source_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_traffic_source_id_fkey"
            columns: ["traffic_source_id"]
            isOneToOne: false
            referencedRelation: "traffic_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      traffic_sources: {
        Row: {
          created_at: string | null
          id: string
          landing_page: string | null
          referrer: string | null
          session_id: string
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          landing_page?: string | null
          referrer?: string | null
          session_id: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          landing_page?: string | null
          referrer?: string | null
          session_id?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          points_earned: number
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          points_earned: number
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          points_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      user_email_automations: {
        Row: {
          created_at: string
          email: string
          email_1_sent_at: string | null
          email_2_sent_at: string | null
          email_3_sent_at: string | null
          id: string
          name: string | null
          unsubscribed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          email_1_sent_at?: string | null
          email_2_sent_at?: string | null
          email_3_sent_at?: string | null
          id?: string
          name?: string | null
          unsubscribed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          email_1_sent_at?: string | null
          email_2_sent_at?: string | null
          email_3_sent_at?: string | null
          id?: string
          name?: string | null
          unsubscribed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          arts_clicked: number
          calendar_used: number
          created_at: string
          id: string
          level: number
          tools_used: number
          total_points: number
          updated_at: string
          user_id: string
          videos_opened: number
        }
        Insert: {
          arts_clicked?: number
          calendar_used?: number
          created_at?: string
          id?: string
          level?: number
          tools_used?: number
          total_points?: number
          updated_at?: string
          user_id: string
          videos_opened?: number
        }
        Update: {
          arts_clicked?: number
          calendar_used?: number
          created_at?: string
          id?: string
          level?: number
          tools_used?: number
          total_points?: number
          updated_at?: string
          user_id?: string
          videos_opened?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_suggestions: {
        Row: {
          created_at: string
          id: string
          status: string
          suggestion_text: string
          updated_at: string
          user_email: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          suggestion_text: string
          updated_at?: string
          user_email: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          suggestion_text?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      abandoned_checkouts_masked: {
        Row: {
          amount: number | null
          created_at: string | null
          email_masked: string | null
          id: string | null
          recovered: boolean | null
          recovered_at: string | null
          session_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          email_masked?: never
          id?: string | null
          recovered?: boolean | null
          recovered_at?: string | null
          session_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          email_masked?: never
          id?: string | null
          recovered?: boolean | null
          recovered_at?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      marketing_stats: {
        Row: {
          campaign: string | null
          conversion_rate: number | null
          leads: number | null
          medium: string | null
          revenue: number | null
          source: string | null
          subscribers: number | null
          visitors: number | null
        }
        Relationships: []
      }
      profiles_admin_view: {
        Row: {
          created_at: string | null
          email_masked: string | null
          first_visit_at: string | null
          id: string | null
          language: string | null
          name: string | null
          phone_masked: string | null
          referrer_url: string | null
          stripe_id_masked: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string | null
          email_masked?: never
          first_visit_at?: string | null
          id?: string | null
          language?: string | null
          name?: string | null
          phone_masked?: never
          referrer_url?: string | null
          stripe_id_masked?: never
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string | null
          email_masked?: never
          first_visit_at?: string | null
          id?: string | null
          language?: string | null
          name?: string | null
          phone_masked?: never
          referrer_url?: string | null
          stripe_id_masked?: never
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_customer_email_audited: {
        Args: { p_reason: string; p_record_id: string; p_table_name: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
