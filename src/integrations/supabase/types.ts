export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_balances: {
        Row: {
          account_number: string
          balance: number
          created_at: string
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      account_registrations: {
        Row: {
          account_type: string
          amount: number
          created_at: string
          currency: string
          discount_code: string | null
          email: string
          id: string
          name: string
          phone: string | null
          status: string
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          account_type: string
          amount: number
          created_at?: string
          currency?: string
          discount_code?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: string
          amount?: number
          created_at?: string
          currency?: string
          discount_code?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      backup_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          used: boolean
          used_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          used?: boolean
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          used?: boolean
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      board_applications: {
        Row: {
          created_at: string
          email: string
          experience: string | null
          id: string
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          experience?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          experience?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          discount_percent: number
          email: string
          expires_at: string
          id: string
          used: boolean
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_percent: number
          email: string
          expires_at: string
          id?: string
          used?: boolean
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_percent?: number
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
          used_at?: string | null
        }
        Relationships: []
      }
      discount_requests: {
        Row: {
          account_type: string
          created_at: string
          email: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          account_type: string
          created_at?: string
          email: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          account_type?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      loan_applications: {
        Row: {
          created_at: string
          email: string
          employment_info: string | null
          id: string
          interest_rate: number
          loan_amount: number
          loan_purpose: string | null
          loan_term_months: number
          monthly_income: number | null
          monthly_payment: number
          name: string
          payment_amount: number | null
          payment_status: string | null
          phone: string | null
          status: string
          stripe_session_id: string | null
          total_payment: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          employment_info?: string | null
          id?: string
          interest_rate?: number
          loan_amount: number
          loan_purpose?: string | null
          loan_term_months: number
          monthly_income?: number | null
          monthly_payment: number
          name: string
          payment_amount?: number | null
          payment_status?: string | null
          phone?: string | null
          status?: string
          stripe_session_id?: string | null
          total_payment: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          employment_info?: string | null
          id?: string
          interest_rate?: number
          loan_amount?: number
          loan_purpose?: string | null
          loan_term_months?: number
          monthly_income?: number | null
          monthly_payment?: number
          name?: string
          payment_amount?: number | null
          payment_status?: string | null
          phone?: string | null
          status?: string
          stripe_session_id?: string | null
          total_payment?: number
          updated_at?: string
        }
        Relationships: []
      }
      messenger_2fa: {
        Row: {
          code_attempts: number | null
          code_expires_at: string | null
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean
          is_primary: boolean
          messenger_id: string
          messenger_type: string
          updated_at: string
          user_id: string
          verification_code: string | null
        }
        Insert: {
          code_attempts?: number | null
          code_expires_at?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          messenger_id: string
          messenger_type: string
          updated_at?: string
          user_id: string
          verification_code?: string | null
        }
        Update: {
          code_attempts?: number | null
          code_expires_at?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          messenger_id?: string
          messenger_type?: string
          updated_at?: string
          user_id?: string
          verification_code?: string | null
        }
        Relationships: []
      }
      newsletter_campaigns: {
        Row: {
          content: string
          created_at: string
          id: string
          recipient_count: number | null
          sent_at: string | null
          status: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          recipient_count?: number | null
          sent_at?: string | null
          status?: string
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          recipient_count?: number | null
          sent_at?: string | null
          status?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          status: string
          subscribed_at: string
          unsubscribe_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          status?: string
          subscribed_at?: string
          unsubscribe_token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          status?: string
          subscribed_at?: string
          unsubscribe_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_number: string
          binance_api_key: string | null
          binance_api_secret: string | null
          binance_connected_at: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          mfa_enabled: boolean
          mfa_verified: boolean
          phone: string | null
          totp_enabled: boolean
          totp_secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          binance_api_key?: string | null
          binance_api_secret?: string | null
          binance_connected_at?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          mfa_enabled?: boolean
          mfa_verified?: boolean
          phone?: string | null
          totp_enabled?: boolean
          totp_secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          binance_api_key?: string | null
          binance_api_secret?: string | null
          binance_connected_at?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          mfa_enabled?: boolean
          mfa_verified?: boolean
          phone?: string | null
          totp_enabled?: boolean
          totp_secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      term_deposits: {
        Row: {
          account_number: string
          amount: number
          contract_signed_at: string
          created_at: string
          id: string
          interest_rate: number
          maturity_date: string
          status: string
          term_months: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          amount: number
          contract_signed_at?: string
          created_at?: string
          id?: string
          interest_rate: number
          maturity_date: string
          status?: string
          term_months: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          amount?: number
          contract_signed_at?: string
          created_at?: string
          id?: string
          interest_rate?: number
          maturity_date?: string
          status?: string
          term_months?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_number: string
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          recipient_account: string | null
          recipient_name: string | null
          status: string
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          recipient_account?: string | null
          recipient_name?: string | null
          status?: string
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          recipient_account?: string | null
          recipient_name?: string | null
          status?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transfer_requests: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          from_account: string
          from_user_id: string
          id: string
          status: string
          to_account: string
          to_name: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          from_account: string
          from_user_id: string
          id?: string
          status?: string
          to_account: string
          to_name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          from_account?: string
          from_user_id?: string
          id?: string
          status?: string
          to_account?: string
          to_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          attempts: number
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          updated_at: string
          used: boolean
          user_id: string
        }
        Insert: {
          attempts?: number
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          updated_at?: string
          used?: boolean
          user_id: string
        }
        Update: {
          attempts?: number
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          updated_at?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atomic_balance_update: {
        Args: {
          p_user_id: string
          p_amount: number
          p_transaction_type: string
          p_description?: string
          p_recipient_account?: string
          p_recipient_name?: string
        }
        Returns: Json
      }
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      calculate_daily_interest: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_expired_verification_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_account_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_backup_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      sanitize_html_input: {
        Args: { input_text: string }
        Returns: string
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
