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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      budget_lines: {
        Row: {
          category_id: string
          created_at: string
          id: string
          planned_amount: number
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          planned_amount?: number
          project_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          planned_amount?: number
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_lines_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_lines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          phase: string
          slug: string
          sort_order: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phase?: string
          slug: string
          sort_order?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phase?: string
          slug?: string
          sort_order?: number
          user_id?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          contract_amount: number | null
          contract_ref: string | null
          created_at: string
          email: string | null
          id: string
          manager: string | null
          name: string
          phone: string | null
          trade: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contract_amount?: number | null
          contract_ref?: string | null
          created_at?: string
          email?: string | null
          id?: string
          manager?: string | null
          name: string
          phone?: string | null
          trade?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          contract_amount?: number | null
          contract_ref?: string | null
          created_at?: string
          email?: string | null
          id?: string
          manager?: string | null
          name?: string
          phone?: string | null
          trade?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          admin_notes: string | null
          company: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          status: Database["public"]["Enums"]["demo_request_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          company?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["demo_request_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["demo_request_status"]
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          city: string | null
          commune: string | null
          company_id: string | null
          created_at: string
          expense_date: string
          id: string
          label: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          project_id: string
          quantity: number | null
          reference: string | null
          supplier_id: string | null
          unit_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category_id?: string | null
          city?: string | null
          commune?: string | null
          company_id?: string | null
          created_at?: string
          expense_date?: string
          id?: string
          label: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          project_id: string
          quantity?: number | null
          reference?: string | null
          supplier_id?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          city?: string | null
          commune?: string | null
          company_id?: string | null
          created_at?: string
          expense_date?: string
          id?: string
          label?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          project_id?: string
          quantity?: number | null
          reference?: string | null
          supplier_id?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string
          expense_id: string | null
          id: string
          kind: Database["public"]["Enums"]["payment_type"]
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          payment_date: string
          project_id: string
          reference: string | null
          supplier_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          company_id?: string | null
          created_at?: string
          expense_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["payment_type"]
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          payment_date?: string
          project_id: string
          reference?: string | null
          supplier_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string
          expense_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["payment_type"]
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          payment_date?: string
          project_id?: string
          reference?: string | null
          supplier_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          address: string | null
          arrondissement: string | null
          budget: number
          built_area: number | null
          city: string | null
          commune: string | null
          created_at: string
          end_date: string | null
          house_type: string | null
          id: string
          land_area: number | null
          levels: number | null
          name: string
          quartier: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          arrondissement?: string | null
          budget?: number
          built_area?: number | null
          city?: string | null
          commune?: string | null
          created_at?: string
          end_date?: string | null
          house_type?: string | null
          id?: string
          land_area?: number | null
          levels?: number | null
          name: string
          quartier?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          address?: string | null
          arrondissement?: string | null
          budget?: number
          built_area?: number | null
          city?: string | null
          commune?: string | null
          created_at?: string
          end_date?: string | null
          house_type?: string | null
          id?: string
          land_area?: number | null
          levels?: number | null
          name?: string
          quartier?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          amount: number
          category_id: string | null
          company_id: string | null
          created_at: string
          id: string
          label: string
          notes: string | null
          project_id: string
          quote_date: string
          reference: string | null
          status: Database["public"]["Enums"]["quote_status"]
          supplier_id: string | null
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          amount?: number
          category_id?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          label: string
          notes?: string | null
          project_id: string
          quote_date?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          supplier_id?: string | null
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          label?: string
          notes?: string | null
          project_id?: string
          quote_date?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          supplier_id?: string | null
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          activity: string | null
          city: string | null
          commune: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          products: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          activity?: string | null
          city?: string | null
          commune?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          products?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Update: {
          activity?: string | null
          city?: string | null
          commune?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          products?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user"
      demo_request_status:
        | "nouveau"
        | "contacte"
        | "planifie"
        | "traite"
        | "archive"
      payment_method:
        | "especes"
        | "mtn_momo"
        | "moov_money"
        | "virement"
        | "cheque"
      payment_type: "comptant" | "acompte" | "partiel" | "solde"
      project_status: "planifie" | "en_cours" | "suspendu" | "termine"
      quote_status: "en_attente" | "accepte" | "rejete" | "converti"
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
      app_role: ["admin", "user"],
      demo_request_status: [
        "nouveau",
        "contacte",
        "planifie",
        "traite",
        "archive",
      ],
      payment_method: [
        "especes",
        "mtn_momo",
        "moov_money",
        "virement",
        "cheque",
      ],
      payment_type: ["comptant", "acompte", "partiel", "solde"],
      project_status: ["planifie", "en_cours", "suspendu", "termine"],
      quote_status: ["en_attente", "accepte", "rejete", "converti"],
    },
  },
} as const
