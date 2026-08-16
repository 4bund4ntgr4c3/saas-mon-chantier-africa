export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          amount_after: number | null;
          amount_before: number | null;
          created_at: string;
          details: Json | null;
          entity: string;
          id: string;
          label: string | null;
          project_id: string | null;
          record_id: string | null;
          user_id: string;
        };
        Insert: {
          action: string;
          amount_after?: number | null;
          amount_before?: number | null;
          created_at?: string;
          details?: Json | null;
          entity: string;
          id?: string;
          label?: string | null;
          project_id?: string | null;
          record_id?: string | null;
          user_id: string;
        };
        Update: {
          action?: string;
          amount_after?: number | null;
          amount_before?: number | null;
          created_at?: string;
          details?: Json | null;
          entity?: string;
          id?: string;
          label?: string | null;
          project_id?: string | null;
          record_id?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      ai_actions: {
        Row: {
          action_type: string;
          conversation_id: string;
          created_at: string;
          id: string;
          payload: Json;
          title: string;
          user_id: string;
        };
        Insert: {
          action_type?: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          payload?: Json;
          title: string;
          user_id?: string;
        };
        Update: {
          action_type?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          payload?: Json;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      ai_conversations: {
        Row: {
          created_at: string;
          id: string;
          project_id: string | null;
          role: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          project_id?: string | null;
          role?: string | null;
          title: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          project_id?: string | null;
          role?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      budget_lines: {
        Row: {
          category_id: string;
          created_at: string;
          id: string;
          planned_amount: number;
          project_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category_id: string;
          created_at?: string;
          id?: string;
          planned_amount?: number;
          project_id: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          category_id?: string;
          created_at?: string;
          id?: string;
          planned_amount?: number;
          project_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_lines_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "budget_lines_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          phase: string;
          slug: string;
          sort_order: number;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          phase?: string;
          slug: string;
          sort_order?: number;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          phase?: string;
          slug?: string;
          sort_order?: number;
          user_id?: string | null;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          contract_amount: number | null;
          contract_ref: string | null;
          created_at: string;
          email: string | null;
          id: string;
          manager: string | null;
          name: string;
          phone: string | null;
          trade: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          contract_amount?: number | null;
          contract_ref?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          manager?: string | null;
          name: string;
          phone?: string | null;
          trade?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          contract_amount?: number | null;
          contract_ref?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          manager?: string | null;
          name?: string;
          phone?: string | null;
          trade?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"];
          created_at: string;
          expiry_date: string | null;
          file_path: string | null;
          id: string;
          mime_type: string | null;
          name: string;
          notes: string | null;
          project_id: string;
          size_bytes: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: Database["public"]["Enums"]["document_category"];
          created_at?: string;
          expiry_date?: string | null;
          file_path?: string | null;
          id?: string;
          mime_type?: string | null;
          name: string;
          notes?: string | null;
          project_id: string;
          size_bytes?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          category?: Database["public"]["Enums"]["document_category"];
          created_at?: string;
          expiry_date?: string | null;
          file_path?: string | null;
          id?: string;
          mime_type?: string | null;
          name?: string;
          notes?: string | null;
          project_id?: string;
          size_bytes?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      demo_requests: {
        Row: {
          admin_notes: string | null;
          attachment_name: string | null;
          attachment_path: string | null;
          company: string | null;
          created_at: string;
          email: string;
          follow_up_date: string | null;
          full_name: string;
          id: string;
          message: string | null;
          phone: string | null;
          status: Database["public"]["Enums"]["demo_request_status"];
          updated_at: string;
        };
        Insert: {
          admin_notes?: string | null;
          attachment_name?: string | null;
          attachment_path?: string | null;
          company?: string | null;
          created_at?: string;
          email: string;
          follow_up_date?: string | null;
          full_name: string;
          id?: string;
          message?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["demo_request_status"];
          updated_at?: string;
        };
        Update: {
          admin_notes?: string | null;
          attachment_name?: string | null;
          attachment_path?: string | null;
          company?: string | null;
          created_at?: string;
          email?: string;
          follow_up_date?: string | null;
          full_name?: string;
          id?: string;
          message?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["demo_request_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      disputes: {
        Row: {
          amount: number | null;
          created_at: string;
          decided_at: string | null;
          decided_by: string | null;
          decision: string | null;
          decision_note: string | null;
          description: string | null;
          id: string;
          ref: string;
          related_id: string | null;
          related_type: string | null;
          status: string;
          subject: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount?: number | null;
          created_at?: string;
          decided_at?: string | null;
          decided_by?: string | null;
          decision?: string | null;
          decision_note?: string | null;
          description?: string | null;
          id?: string;
          ref: string;
          related_id?: string | null;
          related_type?: string | null;
          status?: string;
          subject: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          amount?: number | null;
          created_at?: string;
          decided_at?: string | null;
          decided_by?: string | null;
          decision?: string | null;
          decision_note?: string | null;
          description?: string | null;
          id?: string;
          ref?: string;
          related_id?: string | null;
          related_type?: string | null;
          status?: string;
          subject?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      dispute_evidences: {
        Row: {
          created_at: string;
          dispute_id: string;
          file_path: string | null;
          id: string;
          note: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          dispute_id: string;
          file_path?: string | null;
          id?: string;
          note?: string | null;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          dispute_id?: string;
          file_path?: string | null;
          id?: string;
          note?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dispute_evidences_dispute_id_fkey";
            columns: ["dispute_id"];
            isOneToOne: false;
            referencedRelation: "disputes";
            referencedColumns: ["id"];
          },
        ];
      };
      email_log: {
        Row: {
          details: Json | null;
          id: string;
          items: number;
          kind: string;
          sent_at: string;
          user_id: string;
        };
        Insert: {
          details?: Json | null;
          id?: string;
          items?: number;
          kind: string;
          sent_at?: string;
          user_id: string;
        };
        Update: {
          details?: Record<string, unknown> | null;
          id?: string;
          items?: number;
          kind?: string;
          sent_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      equipment: {
        Row: {
          brand: string | null;
          category: string;
          city: string | null;
          condition: Database["public"]["Enums"]["equipment_condition"];
          created_at: string;
          daily_price: number;
          deposit: number;
          description: string | null;
          id: string;
          image_url: string | null;
          model: string | null;
          name: string;
          quantity: number;
          status: Database["public"]["Enums"]["equipment_status"];
          updated_at: string;
          user_id: string;
          weekly_price: number;
        };
        Insert: {
          brand?: string | null;
          category?: string;
          city?: string | null;
          condition?: Database["public"]["Enums"]["equipment_condition"];
          created_at?: string;
          daily_price?: number;
          deposit?: number;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          model?: string | null;
          name: string;
          quantity?: number;
          status?: Database["public"]["Enums"]["equipment_status"];
          updated_at?: string;
          user_id: string;
          weekly_price?: number;
        };
        Update: {
          brand?: string | null;
          category?: string;
          city?: string | null;
          condition?: Database["public"]["Enums"]["equipment_condition"];
          created_at?: string;
          daily_price?: number;
          deposit?: number;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          model?: string | null;
          name?: string;
          quantity?: number;
          status?: Database["public"]["Enums"]["equipment_status"];
          updated_at?: string;
          user_id?: string;
          weekly_price?: number;
        };
        Relationships: [];
      };
      equipment_rentals: {
        Row: {
          created_at: string;
          daily_price: number;
          delivery_address: string | null;
          delivery_fee: number;
          deposit: number;
          deposit_paid: boolean;
          end_date: string;
          equipment_id: string;
          id: string;
          notes: string | null;
          project_id: string | null;
          return_code: string;
          returned_at: string | null;
          scheduled_at: string | null;
          start_date: string;
          status: Database["public"]["Enums"]["equipment_rental_status"];
          total_price: number;
          updated_at: string;
          user_id: string;
          weekly_price: number;
        };
        Insert: {
          created_at?: string;
          daily_price?: number;
          delivery_address?: string | null;
          delivery_fee?: number;
          deposit?: number;
          deposit_paid?: boolean;
          end_date: string;
          equipment_id: string;
          id?: string;
          notes?: string | null;
          project_id?: string | null;
          return_code?: string;
          returned_at?: string | null;
          scheduled_at?: string | null;
          start_date: string;
          status?: Database["public"]["Enums"]["equipment_rental_status"];
          total_price?: number;
          updated_at?: string;
          user_id: string;
          weekly_price?: number;
        };
        Update: {
          created_at?: string;
          daily_price?: number;
          delivery_address?: string | null;
          delivery_fee?: number;
          deposit?: number;
          deposit_paid?: boolean;
          end_date?: string;
          equipment_id?: string;
          id?: string;
          notes?: string | null;
          project_id?: string | null;
          return_code?: string;
          returned_at?: string | null;
          scheduled_at?: string | null;
          start_date?: string;
          status?: Database["public"]["Enums"]["equipment_rental_status"];
          total_price?: number;
          updated_at?: string;
          user_id?: string;
          weekly_price?: number;
        };
        Relationships: [];
      };
      buildings: {
        Row: {
          created_at: string;
          floor_count: number;
          id: string;
          name: string;
          program_id: string;
          status: Database["public"]["Enums"]["building_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          floor_count?: number;
          id?: string;
          name: string;
          program_id: string;
          status?: Database["public"]["Enums"]["building_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          floor_count?: number;
          id?: string;
          name?: string;
          program_id?: string;
          status?: Database["public"]["Enums"]["building_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      development_programs: {
        Row: {
          address: string | null;
          budget_total: number;
          city: string | null;
          created_at: string;
          description: string | null;
          end_date: string | null;
          id: string;
          image_url: string | null;
          name: string;
          start_date: string | null;
          status: Database["public"]["Enums"]["development_program_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address?: string | null;
          budget_total?: number;
          city?: string | null;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["development_program_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address?: string | null;
          budget_total?: number;
          city?: string | null;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["development_program_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      property_reservations: {
        Row: {
          amount: number;
          client_email: string | null;
          client_name: string;
          client_phone: string | null;
          created_at: string;
          deposit_paid: boolean;
          id: string;
          notes: string | null;
          project_id: string | null;
          status: Database["public"]["Enums"]["property_reservation_status"];
          unit_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          client_email?: string | null;
          client_name: string;
          client_phone?: string | null;
          created_at?: string;
          deposit_paid?: boolean;
          id?: string;
          notes?: string | null;
          project_id?: string | null;
          status?: Database["public"]["Enums"]["property_reservation_status"];
          unit_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          client_email?: string | null;
          client_name?: string;
          client_phone?: string | null;
          created_at?: string;
          deposit_paid?: boolean;
          id?: string;
          notes?: string | null;
          project_id?: string | null;
          status?: Database["public"]["Enums"]["property_reservation_status"];
          unit_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      property_units: {
        Row: {
          bathrooms: number;
          building_id: string;
          created_at: string;
          floor: number;
          id: string;
          label: string;
          price: number;
          rooms: number;
          status: Database["public"]["Enums"]["property_unit_status"];
          surface_m2: number;
          unit_type: Database["public"]["Enums"]["property_unit_type"];
          updated_at: string;
        };
        Insert: {
          bathrooms?: number;
          building_id: string;
          created_at?: string;
          floor?: number;
          id?: string;
          label: string;
          price?: number;
          rooms?: number;
          status?: Database["public"]["Enums"]["property_unit_status"];
          surface_m2?: number;
          unit_type?: Database["public"]["Enums"]["property_unit_type"];
          updated_at?: string;
        };
        Update: {
          bathrooms?: number;
          building_id?: string;
          created_at?: string;
          floor?: number;
          id?: string;
          label?: string;
          price?: number;
          rooms?: number;
          status?: Database["public"]["Enums"]["property_unit_status"];
          surface_m2?: number;
          unit_type?: Database["public"]["Enums"]["property_unit_type"];
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string | null;
          channel: Database["public"]["Enums"]["notification_channel"];
          created_at: string;
          id: string;
          kind: Database["public"]["Enums"]["notification_kind"];
          link: string | null;
          project_id: string | null;
          read_at: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          channel?: Database["public"]["Enums"]["notification_channel"];
          created_at?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["notification_kind"];
          link?: string | null;
          project_id?: string | null;
          read_at?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          channel?: Database["public"]["Enums"]["notification_channel"];
          created_at?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["notification_kind"];
          link?: string | null;
          project_id?: string | null;
          read_at?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      device_tokens: {
        Row: {
          created_at: string;
          id: string;
          last_seen_at: string;
          platform: string;
          token: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_seen_at?: string;
          platform?: string;
          token: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_seen_at?: string;
          platform?: string;
          token?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          alert_budget: boolean;
          alert_documents: boolean;
          alert_due_payments: boolean;
          alert_late_payments: boolean;
          alert_projects: boolean;
          alerts_enabled: boolean;
          created_at: string;
          email: string | null;
          last_digest_at: string | null;
          push_enabled: boolean;
          sms_enabled: boolean;
          updated_at: string;
          user_id: string;
          weekly_digest: boolean;
          whatsapp_enabled: boolean;
        };
        Insert: {
          alert_budget?: boolean;
          alert_documents?: boolean;
          alert_due_payments?: boolean;
          alert_late_payments?: boolean;
          alert_projects?: boolean;
          alerts_enabled?: boolean;
          created_at?: string;
          email?: string | null;
          last_digest_at?: string | null;
          push_enabled?: boolean;
          sms_enabled?: boolean;
          updated_at?: string;
          user_id: string;
          weekly_digest?: boolean;
          whatsapp_enabled?: boolean;
        };
        Update: {
          alert_budget?: boolean;
          alert_documents?: boolean;
          alert_due_payments?: boolean;
          alert_late_payments?: boolean;
          alert_projects?: boolean;
          alerts_enabled?: boolean;
          created_at?: string;
          email?: string | null;
          last_digest_at?: string | null;
          push_enabled?: boolean;
          sms_enabled?: boolean;
          updated_at?: string;
          user_id?: string;
          weekly_digest?: boolean;
          whatsapp_enabled?: boolean;
        };
        Relationships: [];
      };
      invoice_payments: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          invoice_id: string;
          method: Database["public"]["Enums"]["payment_method"];
          notes: string | null;
          payment_date: string;
          project_id: string;
          reference: string | null;
          user_id: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          id?: string;
          invoice_id: string;
          method?: Database["public"]["Enums"]["payment_method"];
          notes?: string | null;
          payment_date?: string;
          project_id: string;
          reference?: string | null;
          user_id?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          invoice_id?: string;
          method?: Database["public"]["Enums"]["payment_method"];
          notes?: string | null;
          payment_date?: string;
          project_id?: string;
          reference?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoice_payments_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      invoice_items: {
        Row: {
          created_at: string;
          designation: string;
          id: string;
          invoice_id: string;
          quantity: string;
          unit: string | null;
          unit_price: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          designation: string;
          id?: string;
          invoice_id: string;
          quantity?: string;
          unit?: string | null;
          unit_price?: number;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          designation?: string;
          id?: string;
          invoice_id?: string;
          quantity?: string;
          unit?: string | null;
          unit_price?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
        ];
      };
      invoices: {
        Row: {
          amount: number;
          created_at: string;
          due_date: string | null;
          id: string;
          invoice_date: string;
          notes: string | null;
          project_id: string;
          reference: string | null;
          status: Database["public"]["Enums"]["invoice_status"];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          invoice_date?: string;
          notes?: string | null;
          project_id: string;
          reference?: string | null;
          status?: Database["public"]["Enums"]["invoice_status"];
          title: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          invoice_date?: string;
          notes?: string | null;
          project_id?: string;
          reference?: string | null;
          status?: Database["public"]["Enums"]["invoice_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      material_deliveries: {
        Row: {
          created_at: string;
          delivered_at: string | null;
          id: string;
          notes: string | null;
          project_id: string;
          quantity: number;
          requirement_id: string | null;
          status: string;
          supplier_id: string | null;
          unit_price: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          delivered_at?: string | null;
          id?: string;
          notes?: string | null;
          project_id: string;
          quantity?: number;
          requirement_id?: string | null;
          status?: string;
          supplier_id?: string | null;
          unit_price?: number;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          delivered_at?: string | null;
          id?: string;
          notes?: string | null;
          project_id?: string;
          quantity?: number;
          requirement_id?: string | null;
          status?: string;
          supplier_id?: string | null;
          unit_price?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "material_deliveries_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "material_deliveries_requirement_id_fkey";
            columns: ["requirement_id"];
            isOneToOne: false;
            referencedRelation: "material_requirements";
            referencedColumns: ["id"];
          },
        ];
      };
      material_requirements: {
        Row: {
          category: string | null;
          created_at: string;
          id: string;
          name: string;
          notes: string | null;
          project_id: string;
          quantity_consumed: number;
          quantity_delivered: number;
          quantity_needed: number;
          quantity_ordered: number;
          status: string;
          supplier_id: string | null;
          unit: string | null;
          unit_price: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          notes?: string | null;
          project_id: string;
          quantity_consumed?: number;
          quantity_delivered?: number;
          quantity_needed?: number;
          quantity_ordered?: number;
          status?: string;
          supplier_id?: string | null;
          unit?: string | null;
          unit_price?: number;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          project_id?: string;
          quantity_consumed?: number;
          quantity_delivered?: number;
          quantity_needed?: number;
          quantity_ordered?: number;
          status?: string;
          supplier_id?: string | null;
          unit?: string | null;
          unit_price?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "material_requirements_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      materials: {
        Row: {
          category: string | null;
          created_at: string;
          id: string;
          name: string;
          notes: string | null;
          project_id: string;
          quantity: number;
          reorder_level: number;
          supplier_id: string | null;
          unit: string | null;
          unit_price: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          notes?: string | null;
          project_id: string;
          quantity?: number;
          reorder_level?: number;
          supplier_id?: string | null;
          unit?: string | null;
          unit_price?: number;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          project_id?: string;
          quantity?: number;
          reorder_level?: number;
          supplier_id?: string | null;
          unit?: string | null;
          unit_price?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "materials_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "materials_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      photos: {
        Row: {
          caption: string | null;
          category_id: string | null;
          created_at: string;
          file_path: string;
          id: string;
          phase: string | null;
          project_id: string;
          taken_at: string | null;
          user_id: string;
        };
        Insert: {
          caption?: string | null;
          category_id?: string | null;
          created_at?: string;
          file_path: string;
          id?: string;
          phase?: string | null;
          project_id: string;
          taken_at?: string | null;
          user_id?: string;
        };
        Update: {
          caption?: string | null;
          category_id?: string | null;
          created_at?: string;
          file_path?: string;
          id?: string;
          phase?: string | null;
          project_id?: string;
          taken_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          created_at: string;
          description: string | null;
          due_date: string | null;
          id: string;
          priority: Database["public"]["Enums"]["task_priority"];
          project_id: string;
          status: Database["public"]["Enums"]["task_status"];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: Database["public"]["Enums"]["task_priority"];
          project_id: string;
          status?: Database["public"]["Enums"]["task_status"];
          title: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: Database["public"]["Enums"]["task_priority"];
          project_id?: string;
          status?: Database["public"]["Enums"]["task_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          amount: number;
          category_id: string | null;
          city: string | null;
          commune: string | null;
          company_id: string | null;
          created_at: string;
          expense_date: string;
          id: string;
          label: string;
          method: Database["public"]["Enums"]["payment_method"];
          notes: string | null;
          project_id: string;
          quantity: number | null;
          reference: string | null;
          supplier_id: string | null;
          unit_price: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          category_id?: string | null;
          city?: string | null;
          commune?: string | null;
          company_id?: string | null;
          created_at?: string;
          expense_date?: string;
          id?: string;
          label: string;
          method?: Database["public"]["Enums"]["payment_method"];
          notes?: string | null;
          project_id: string;
          quantity?: number | null;
          reference?: string | null;
          supplier_id?: string | null;
          unit_price?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          amount?: number;
          category_id?: string | null;
          city?: string | null;
          commune?: string | null;
          company_id?: string | null;
          created_at?: string;
          expense_date?: string;
          id?: string;
          label?: string;
          method?: Database["public"]["Enums"]["payment_method"];
          notes?: string | null;
          project_id?: string;
          quantity?: number | null;
          reference?: string | null;
          supplier_id?: string | null;
          unit_price?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_transactions: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          id: string;
          order_id: string | null;
          phone: string | null;
          project_id: string | null;
          provider: Database["public"]["Enums"]["payment_provider"];
          raw_response: Json | null;
          reference: string | null;
          status: Database["public"]["Enums"]["payment_transaction_status"];
          transaction_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          order_id?: string | null;
          phone?: string | null;
          project_id?: string | null;
          provider?: Database["public"]["Enums"]["payment_provider"];
          raw_response?: Json | null;
          reference?: string | null;
          status?: Database["public"]["Enums"]["payment_transaction_status"];
          transaction_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          order_id?: string | null;
          phone?: string | null;
          project_id?: string | null;
          provider?: Database["public"]["Enums"]["payment_provider"];
          raw_response?: Json | null;
          reference?: string | null;
          status?: Database["public"]["Enums"]["payment_transaction_status"];
          transaction_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_transactions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          company_id: string | null;
          created_at: string;
          due_date: string | null;
          expense_id: string | null;
          id: string;
          kind: Database["public"]["Enums"]["payment_type"];
          method: Database["public"]["Enums"]["payment_method"];
          notes: string | null;
          payment_date: string;
          phone: string | null;
          project_id: string;
          provider: Database["public"]["Enums"]["payment_provider"] | null;
          reference: string | null;
          status: Database["public"]["Enums"]["payment_transaction_status"];
          supplier_id: string | null;
          transaction_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          company_id?: string | null;
          created_at?: string;
          due_date?: string | null;
          expense_id?: string | null;
          id?: string;
          kind?: Database["public"]["Enums"]["payment_type"];
          method?: Database["public"]["Enums"]["payment_method"];
          notes?: string | null;
          payment_date?: string;
          phone?: string | null;
          project_id: string;
          provider?: Database["public"]["Enums"]["payment_provider"] | null;
          reference?: string | null;
          status?: Database["public"]["Enums"]["payment_transaction_status"];
          supplier_id?: string | null;
          transaction_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          amount?: number;
          company_id?: string | null;
          created_at?: string;
          due_date?: string | null;
          expense_id?: string | null;
          id?: string;
          kind?: Database["public"]["Enums"]["payment_type"];
          method?: Database["public"]["Enums"]["payment_method"];
          notes?: string | null;
          payment_date?: string;
          phone?: string | null;
          project_id?: string;
          provider?: Database["public"]["Enums"]["payment_provider"] | null;
          reference?: string | null;
          status?: Database["public"]["Enums"]["payment_transaction_status"];
          supplier_id?: string | null;
          transaction_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_expense_id_fkey";
            columns: ["expense_id"];
            isOneToOne: false;
            referencedRelation: "expenses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"];
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"];
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"];
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          address: string | null;
          arrondissement: string | null;
          budget: number;
          built_area: number | null;
          city: string | null;
          commune: string | null;
          created_at: string;
          end_date: string | null;
          house_type: string | null;
          id: string;
          land_area: number | null;
          lat: number | null;
          levels: number | null;
          lng: number | null;
          name: string;
          quartier: string | null;
          share_token: string | null;
          start_date: string | null;
          status: Database["public"]["Enums"]["project_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address?: string | null;
          arrondissement?: string | null;
          budget?: number;
          built_area?: number | null;
          city?: string | null;
          commune?: string | null;
          created_at?: string;
          end_date?: string | null;
          house_type?: string | null;
          id?: string;
          land_area?: number | null;
          lat?: number | null;
          levels?: number | null;
          lng?: number | null;
          name: string;
          quartier?: string | null;
          share_token?: string | null;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          address?: string | null;
          arrondissement?: string | null;
          budget?: number;
          built_area?: number | null;
          city?: string | null;
          commune?: string | null;
          created_at?: string;
          end_date?: string | null;
          house_type?: string | null;
          id?: string;
          land_area?: number | null;
          lat?: number | null;
          levels?: number | null;
          lng?: number | null;
          name?: string;
          quartier?: string | null;
          share_token?: string | null;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      quote_items: {
        Row: {
          created_at: string;
          designation: string;
          id: string;
          quantity: number;
          quote_id: string;
          unit: string | null;
          unit_price: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          designation: string;
          id?: string;
          quantity?: number;
          quote_id: string;
          unit?: string | null;
          unit_price?: number;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          designation?: string;
          id?: string;
          quantity?: number;
          quote_id?: string;
          unit?: string | null;
          unit_price?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
        ];
      };
      quote_requests: {
        Row: {
          budget_max: number | null;
          budget_min: number | null;
          category: string | null;
          city: string | null;
          commune: string | null;
          created_at: string;
          deadline: string | null;
          description: string | null;
          id: string;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
          winner_bid_id: string | null;
        };
        Insert: {
          budget_max?: number | null;
          budget_min?: number | null;
          category?: string | null;
          city?: string | null;
          commune?: string | null;
          created_at?: string;
          deadline?: string | null;
          description?: string | null;
          id?: string;
          status?: string;
          title: string;
          updated_at?: string;
          user_id?: string;
          winner_bid_id?: string | null;
        };
        Update: {
          budget_max?: number | null;
          budget_min?: number | null;
          category?: string | null;
          city?: string | null;
          commune?: string | null;
          created_at?: string;
          deadline?: string | null;
          description?: string | null;
          id?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
          winner_bid_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quote_requests_winner_bid_fkey";
            columns: ["winner_bid_id"];
            isOneToOne: false;
            referencedRelation: "quote_bids";
            referencedColumns: ["id"];
          },
        ];
      };
      quote_bids: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          message: string | null;
          request_id: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          id?: string;
          message?: string | null;
          request_id: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          message?: string | null;
          request_id?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quote_bids_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "quote_requests";
            referencedColumns: ["id"];
          },
        ];
      };
      quotes: {
        Row: {
          amount: number;
          category_id: string | null;
          company_id: string | null;
          created_at: string;
          id: string;
          label: string;
          notes: string | null;
          project_id: string;
          quote_date: string;
          reference: string | null;
          status: Database["public"]["Enums"]["quote_status"];
          supplier_id: string | null;
          updated_at: string;
          user_id: string;
          valid_until: string | null;
        };
        Insert: {
          amount?: number;
          category_id?: string | null;
          company_id?: string | null;
          created_at?: string;
          id?: string;
          label: string;
          notes?: string | null;
          project_id: string;
          quote_date?: string;
          reference?: string | null;
          status?: Database["public"]["Enums"]["quote_status"];
          supplier_id?: string | null;
          updated_at?: string;
          user_id?: string;
          valid_until?: string | null;
        };
        Update: {
          amount?: number;
          category_id?: string | null;
          company_id?: string | null;
          created_at?: string;
          id?: string;
          label?: string;
          notes?: string | null;
          project_id?: string;
          quote_date?: string;
          reference?: string | null;
          status?: Database["public"]["Enums"]["quote_status"];
          supplier_id?: string | null;
          updated_at?: string;
          user_id?: string;
          valid_until?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quotes_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      site_logs: {
        Row: {
          category_id: string | null;
          comment: string | null;
          created_at: string;
          difficulties: string | null;
          id: string;
          log_date: string;
          photos: string[];
          progress: number;
          project_id: string;
          title: string;
          updated_at: string;
          user_id: string;
          weather: string | null;
          workers: number | null;
        };
        Insert: {
          category_id?: string | null;
          comment?: string | null;
          created_at?: string;
          difficulties?: string | null;
          id?: string;
          log_date?: string;
          photos?: string[];
          progress?: number;
          project_id: string;
          title: string;
          updated_at?: string;
          user_id?: string;
          weather?: string | null;
          workers?: number | null;
        };
        Update: {
          category_id?: string | null;
          comment?: string | null;
          created_at?: string;
          difficulties?: string | null;
          id?: string;
          log_date?: string;
          photos?: string[];
          progress?: number;
          project_id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
          weather?: string | null;
          workers?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "site_logs_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_logs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      suppliers: {
        Row: {
          activity: string | null;
          city: string | null;
          commune: string | null;
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          products: string | null;
          updated_at: string;
          user_id: string;
          whatsapp: string | null;
        };
        Insert: {
          activity?: string | null;
          city?: string | null;
          commune?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          products?: string | null;
          updated_at?: string;
          user_id?: string;
          whatsapp?: string | null;
        };
        Update: {
          activity?: string | null;
          city?: string | null;
          commune?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          products?: string | null;
          updated_at?: string;
          user_id?: string;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          created_at: string;
          id: string;
          organization_id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organization_id: string;
          role?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          organization_id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      project_members: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          project_id: string;
          role: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          project_id: string;
          role?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          project_id?: string;
          role?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      providers: {
        Row: {
          active: boolean;
          category: string | null;
          certifications: string | null;
          city: string | null;
          commune: string | null;
          contact_name: string | null;
          created_at: string;
          email: string | null;
          id: string;
          lat: number | null;
          lng: number | null;
          name: string;
          phone: string | null;
          rating: number;
          review_count: number;
          services: string | null;
          updated_at: string;
          user_id: string | null;
          verified: boolean;
          website: string | null;
          whatsapp: string | null;
          years_experience: number | null;
        };
        Insert: {
          active?: boolean;
          category?: string | null;
          certifications?: string | null;
          city?: string | null;
          commune?: string | null;
          contact_name?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          name: string;
          phone?: string | null;
          rating?: number;
          review_count?: number;
          services?: string | null;
          updated_at?: string;
          user_id?: string | null;
          verified?: boolean;
          website?: string | null;
          whatsapp?: string | null;
          years_experience?: number | null;
        };
        Update: {
          active?: boolean;
          category?: string | null;
          certifications?: string | null;
          city?: string | null;
          commune?: string | null;
          contact_name?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          name?: string;
          phone?: string | null;
          rating?: number;
          review_count?: number;
          services?: string | null;
          updated_at?: string;
          user_id?: string | null;
          verified?: boolean;
          website?: string | null;
          whatsapp?: string | null;
          years_experience?: number | null;
        };
        Relationships: [];
      };
      provider_reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          provider_id: string;
          rating: number;
          user_id: string;
          verified: boolean;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          provider_id: string;
          rating: number;
          user_id?: string;
          verified?: boolean;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          provider_id?: string;
          rating?: number;
          user_id?: string;
          verified?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "provider_reviews_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "providers";
            referencedColumns: ["id"];
          },
        ];
      };
      cart_items: {
        Row: {
          cart_id: string;
          created_at: string;
          id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          cart_id: string;
          created_at?: string;
          id?: string;
          product_id: string;
          quantity?: number;
          unit_price?: number;
        };
        Update: {
          cart_id?: string;
          created_at?: string;
          id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey";
            columns: ["cart_id"];
            isOneToOne: false;
            referencedRelation: "carts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      carts: {
        Row: {
          created_at: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      deliveries: {
        Row: {
          confirmation_code: string | null;
          created_at: string;
          current_lat: number | null;
          current_lng: number | null;
          delivered_at: string | null;
          driver_id: string | null;
          fee: number;
          from_address: string | null;
          id: string;
          lat: number | null;
          lng: number | null;
          order_id: string;
          phone: string | null;
          position_updated_at: string | null;
          proof_photo: string | null;
          scheduled_at: string | null;
          signature_path: string | null;
          status: string;
          to_address: string | null;
          updated_at: string;
          user_id: string;
          vehicle_id: string | null;
          weight: number | null;
        };
        Insert: {
          confirmation_code?: string | null;
          created_at?: string;
          current_lat?: number | null;
          current_lng?: number | null;
          delivered_at?: string | null;
          driver_id?: string | null;
          fee?: number;
          from_address?: string | null;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          order_id: string;
          phone?: string | null;
          position_updated_at?: string | null;
          proof_photo?: string | null;
          scheduled_at?: string | null;
          signature_path?: string | null;
          status?: string;
          to_address?: string | null;
          updated_at?: string;
          user_id: string;
          vehicle_id?: string | null;
          weight?: number | null;
        };
        Update: {
          confirmation_code?: string | null;
          created_at?: string;
          current_lat?: number | null;
          current_lng?: number | null;
          delivered_at?: string | null;
          driver_id?: string | null;
          fee?: number;
          from_address?: string | null;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          order_id?: string;
          phone?: string | null;
          position_updated_at?: string | null;
          proof_photo?: string | null;
          scheduled_at?: string | null;
          signature_path?: string | null;
          status?: string;
          to_address?: string | null;
          updated_at?: string;
          user_id?: string;
          vehicle_id?: string | null;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "deliveries_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deliveries_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deliveries_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      drivers: {
        Row: {
          available: boolean;
          capacity: number | null;
          city: string | null;
          created_at: string;
          id: string;
          name: string;
          phone: string | null;
          price_per_km: number;
          rating: number;
          review_count: number;
          updated_at: string;
          user_id: string;
          vehicle_type: string | null;
          verified: boolean;
          whatsapp: string | null;
          zone: string | null;
        };
        Insert: {
          available?: boolean;
          capacity?: number | null;
          city?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          phone?: string | null;
          price_per_km?: number;
          rating?: number;
          review_count?: number;
          updated_at?: string;
          user_id: string;
          vehicle_type?: string | null;
          verified?: boolean;
          whatsapp?: string | null;
          zone?: string | null;
        };
        Update: {
          available?: boolean;
          capacity?: number | null;
          city?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          phone?: string | null;
          price_per_km?: number;
          rating?: number;
          review_count?: number;
          updated_at?: string;
          user_id?: string;
          vehicle_type?: string | null;
          verified?: boolean;
          whatsapp?: string | null;
          zone?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          is_read: boolean;
          project_id: string | null;
          recipient_id: string | null;
          sender_id: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          project_id?: string | null;
          recipient_id?: string | null;
          sender_id: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          project_id?: string | null;
          recipient_id?: string | null;
          sender_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          unit: string | null;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          order_id: string;
          product_id?: string | null;
          quantity?: number;
          unit?: string | null;
          unit_price?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          order_id?: string;
          product_id?: string | null;
          quantity?: number;
          unit?: string | null;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          city: string | null;
          created_at: string;
          delivery_address: string | null;
          delivery_fee: number;
          id: string;
          lat: number | null;
          lng: number | null;
          notes: string | null;
          ordered_at: string;
          payment_method: string | null;
          payment_status: string | null;
          phone: string | null;
          project_id: string | null;
          reference: string | null;
          status: string;
          store_id: string;
          subtotal: number;
          total: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          city?: string | null;
          created_at?: string;
          delivery_address?: string | null;
          delivery_fee?: number;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          notes?: string | null;
          ordered_at?: string;
          payment_method?: string | null;
          payment_status?: string;
          phone?: string | null;
          project_id?: string | null;
          reference?: string | null;
          status?: string;
          store_id: string;
          subtotal?: number;
          total?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          city?: string | null;
          created_at?: string;
          delivery_address?: string | null;
          delivery_fee?: number;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          notes?: string | null;
          ordered_at?: string;
          payment_method?: string | null;
          payment_status?: string;
          phone?: string | null;
          project_id?: string | null;
          reference?: string | null;
          status?: string;
          store_id?: string;
          subtotal?: number;
          total?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          annotations: Json;
          created_at: string;
          file_path: string;
          id: string;
          mime_type: string | null;
          name: string;
          project_id: string;
          size_bytes: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          annotations?: Json;
          created_at?: string;
          file_path: string;
          id?: string;
          mime_type?: string | null;
          name: string;
          project_id: string;
          size_bytes?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          annotations?: Json;
          created_at?: string;
          file_path?: string;
          id?: string;
          mime_type?: string | null;
          name?: string;
          project_id?: string;
          size_bytes?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plans_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      product_categories: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          parent_id: string | null;
          slug: string | null;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          parent_id?: string | null;
          slug?: string | null;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          parent_id?: string | null;
          slug?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_inventory: {
        Row: {
          created_at: string;
          id: string;
          note: string | null;
          product_id: string;
          quantity_delta: number;
          reason: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          note?: string | null;
          product_id: string;
          quantity_delta: number;
          reason?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          note?: string | null;
          product_id?: string;
          quantity_delta?: number;
          reason?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_inventory_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_prices: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          compare_price: number | null;
          id: string;
          note: string | null;
          price: number;
          product_id: string;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          compare_price?: number | null;
          id?: string;
          note?: string | null;
          price: number;
          product_id: string;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          compare_price?: number | null;
          id?: string;
          note?: string | null;
          price?: number;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_prices_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          active: boolean;
          brand: string | null;
          category_id: string | null;
          compare_price: number | null;
          created_at: string;
          delivery_available: boolean;
          description: string | null;
          features: string | null;
          id: string;
          images: string[];
          min_order_quantity: number;
          name: string;
          price: number;
          rating: number;
          reference: string | null;
          review_count: number;
          stock: number;
          store_id: string;
          unit: string | null;
          updated_at: string;
          user_id: string;
          warranty: string | null;
        };
        Insert: {
          active?: boolean;
          brand?: string | null;
          category_id?: string | null;
          compare_price?: number | null;
          created_at?: string;
          delivery_available?: boolean;
          description?: string | null;
          features?: string | null;
          id?: string;
          images?: string[];
          min_order_quantity?: number;
          name: string;
          price?: number;
          rating?: number;
          reference?: string | null;
          review_count?: number;
          stock?: number;
          store_id: string;
          unit?: string | null;
          updated_at?: string;
          user_id: string;
          warranty?: string | null;
        };
        Update: {
          active?: boolean;
          brand?: string | null;
          category_id?: string | null;
          compare_price?: number | null;
          created_at?: string;
          delivery_available?: boolean;
          description?: string | null;
          features?: string | null;
          id?: string;
          images?: string[];
          min_order_quantity?: number;
          name?: string;
          price?: number;
          rating?: number;
          reference?: string | null;
          review_count?: number;
          stock?: number;
          store_id?: string;
          unit?: string | null;
          updated_at?: string;
          user_id?: string;
          warranty?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      market_reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          rating: number;
          target_id: string;
          target_type: string;
          user_id: string;
          verified: boolean;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating: number;
          target_id: string;
          target_type: string;
          user_id?: string;
          verified?: boolean;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating?: number;
          target_id?: string;
          target_type?: string;
          user_id?: string;
          verified?: boolean;
        };
        Relationships: [];
      };
      profile_verifications: {
        Row: {
          created_at: string;
          id: string;
          level: string;
          premium: boolean;
          updated_at: string;
          user_id: string;
          verified_business: boolean;
          verified_documents: boolean;
          verified_identity: boolean;
          verified_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          level?: string;
          premium?: boolean;
          updated_at?: string;
          user_id: string;
          verified_business?: boolean;
          verified_documents?: boolean;
          verified_identity?: boolean;
          verified_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          level?: string;
          premium?: boolean;
          updated_at?: string;
          user_id?: string;
          verified_business?: boolean;
          verified_documents?: boolean;
          verified_identity?: boolean;
          verified_at?: string | null;
        };
        Relationships: [];
      };
      verification_documents: {
        Row: {
          admin_note: string | null;
          created_at: string;
          doc_type: string;
          file_path: string | null;
          id: string;
          note: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          admin_note?: string | null;
          created_at?: string;
          doc_type?: string;
          file_path?: string | null;
          id?: string;
          note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          admin_note?: string | null;
          created_at?: string;
          doc_type?: string;
          file_path?: string | null;
          id?: string;
          note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      refunds: {
        Row: {
          amount: number;
          created_at: string;
          dispute_id: string;
          id: string;
          method: string;
          processed_at: string | null;
          reference: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          dispute_id: string;
          id?: string;
          method?: string;
          processed_at?: string | null;
          reference?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          dispute_id?: string;
          id?: string;
          method?: string;
          processed_at?: string | null;
          reference?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "refunds_dispute_id_fkey";
            columns: ["dispute_id"];
            isOneToOne: false;
            referencedRelation: "disputes";
            referencedColumns: ["id"];
          },
        ];
      };
      reserves: {
        Row: {
          assigned_to: string | null;
          category_id: string | null;
          created_at: string;
          description: string | null;
          due_date: string | null;
          id: string;
          location: string | null;
          photo_path: string | null;
          priority: string;
          project_id: string;
          resolved_at: string | null;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          assigned_to?: string | null;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          location?: string | null;
          photo_path?: string | null;
          priority?: string;
          project_id: string;
          resolved_at?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          assigned_to?: string | null;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          location?: string | null;
          photo_path?: string | null;
          priority?: string;
          project_id?: string;
          resolved_at?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reserves_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reserves_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      stores: {
        Row: {
          active: boolean;
          address: string | null;
          city: string | null;
          commune: string | null;
          created_at: string;
          delivery_available: boolean;
          delivery_radius_km: number | null;
          delivery_zone: string | null;
          description: string | null;
          email: string | null;
          id: string;
          lat: number | null;
          lng: number | null;
          logo_path: string | null;
          name: string;
          opening_hours: string | null;
          phone: string | null;
          rating: number;
          review_count: number;
          slug: string | null;
          updated_at: string;
          user_id: string;
          verified: boolean;
          whatsapp: string | null;
        };
        Insert: {
          active?: boolean;
          address?: string | null;
          city?: string | null;
          commune?: string | null;
          created_at?: string;
          delivery_available?: boolean;
          delivery_radius_km?: number | null;
          delivery_zone?: string | null;
          description?: string | null;
          email?: string | null;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          logo_path?: string | null;
          name: string;
          opening_hours?: string | null;
          phone?: string | null;
          rating?: number;
          review_count?: number;
          slug?: string | null;
          updated_at?: string;
          user_id: string;
          verified?: boolean;
          whatsapp?: string | null;
        };
        Update: {
          active?: boolean;
          address?: string | null;
          city?: string | null;
          commune?: string | null;
          created_at?: string;
          delivery_available?: boolean;
          delivery_radius_km?: number | null;
          delivery_zone?: string | null;
          description?: string | null;
          email?: string | null;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          logo_path?: string | null;
          name?: string;
          opening_hours?: string | null;
          phone?: string | null;
          rating?: number;
          review_count?: number;
          slug?: string | null;
          updated_at?: string;
          user_id?: string;
          verified?: boolean;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          capacity: number | null;
          created_at: string;
          driver_id: string | null;
          id: string;
          photo_path: string | null;
          plate: string | null;
          type: string | null;
          user_id: string;
        };
        Insert: {
          capacity?: number | null;
          created_at?: string;
          driver_id?: string | null;
          id?: string;
          photo_path?: string | null;
          plate?: string | null;
          type?: string | null;
          user_id: string;
        };
        Update: {
          capacity?: number | null;
          created_at?: string;
          driver_id?: string | null;
          id?: string;
          photo_path?: string | null;
          plate?: string | null;
          type?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vehicles_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      seed_demo_data: { Args: { _user_id: string }; Returns: undefined };
      get_shared_project: { Args: { p_token: string }; Returns: string };
      get_payment_link_order: { Args: { p_reference: string }; Returns: string };
    };
    Enums: {
      account_type:
        | "particulier"
        | "maitre_oeuvre"
        | "entreprise"
        | "artisan"
        | "quincaillerie"
        | "transporteur"
        | "promoteur";
      app_role: "admin" | "user";
      delivery_status:
        "planifiee" | "en_attente_transporteur" | "en_livraison" | "livree" | "annulee";
      demo_request_status: "nouvelle" | "contactee" | "convertie" | "refusee";
      document_category:
        | "plan"
        | "permis_construire"
        | "acte_vente"
        | "facture"
        | "contrat"
        | "garantie"
        | "photo_chantier"
        | "autre";
      equipment_condition: "excellent" | "bon" | "moyen" | "mauvais";
      equipment_rental_status:
        | "demande"
        | "confirmee"
        | "en_cours"
        | "retour_en_cours"
        | "terminee"
        | "annulee"
        | "litige";
      equipment_status: "disponible" | "loue" | "hors_service";
      building_status: "planification" | "en_construction" | "livre";
      development_program_status:
        "planification" | "commercialisation" | "en_construction" | "livre";
      property_reservation_status: "demande" | "confirmee" | "vendue" | "annulee";
      property_unit_status: "disponible" | "reserve" | "vendu";
      property_unit_type:
        "appartement" | "villa" | "boutique" | "bureau" | "terrain" | "garage" | "magasin";
      invoice_status: "emise" | "partielle" | "payee" | "annulee";
      notification_channel: "in_app" | "email" | "push" | "sms" | "whatsapp";
      notification_kind:
        | "alerte"
        | "commande"
        | "livraison"
        | "paiement"
        | "devis"
        | "rapport"
        | "litige"
        | "verification"
        | "assistant";
      order_status:
        | "creee"
        | "paiement_en_attente"
        | "payee"
        | "preparation"
        | "prete"
        | "en_livraison"
        | "livree"
        | "annulee"
        | "remboursee"
        | "litige";
      payment_method: "especes" | "mtn_momo" | "moov_money" | "virement" | "cheque";
      payment_provider: "mtn_momo" | "moov_money" | "paydunya" | "bankly" | "cmi" | "paystack";
      payment_transaction_status: "initiee" | "en_attente" | "confirmee" | "echouee" | "annulee";
      payment_type: "comptant" | "acompte" | "partiel" | "solde";
      project_status: "planifie" | "en_cours" | "suspendu" | "termine";
      quote_status: "en_attente" | "accepte" | "rejete" | "converti";
      reserve_priority: "basse" | "moyenne" | "haute" | "critique";
      reserve_status: "ouverte" | "en_cours" | "resolue" | "annulee";
      task_priority: "basse" | "moyenne" | "haute";
      task_status: "a_faire" | "en_cours" | "terminee" | "annulee";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      account_type: [
        "particulier",
        "maitre_oeuvre",
        "entreprise",
        "artisan",
        "quincaillerie",
        "transporteur",
        "promoteur",
      ],
      ai_action_type: ["achat", "finance", "planning", "document", "recommandation", "autre"],
      app_role: ["admin", "user"],
      delivery_status: [
        "planifiee",
        "en_attente_transporteur",
        "en_livraison",
        "livree",
        "annulee",
      ],
      demo_request_status: ["nouvelle", "contactee", "convertie", "refusee"],
      document_category: [
        "plan",
        "permis_construire",
        "acte_vente",
        "facture",
        "contrat",
        "garantie",
        "photo_chantier",
        "autre",
      ],
      equipment_condition: ["excellent", "bon", "moyen", "mauvais"],
      equipment_rental_status: [
        "demande",
        "confirmee",
        "en_cours",
        "retour_en_cours",
        "terminee",
        "annulee",
        "litige",
      ],
      equipment_status: ["disponible", "loue", "hors_service"],
      building_status: ["planification", "en_construction", "livre"],
      development_program_status: [
        "planification",
        "commercialisation",
        "en_construction",
        "livre",
      ],
      property_reservation_status: ["demande", "confirmee", "vendue", "annulee"],
      property_unit_status: ["disponible", "reserve", "vendu"],
      property_unit_type: [
        "appartement",
        "villa",
        "boutique",
        "bureau",
        "terrain",
        "garage",
        "magasin",
      ],
      order_status: [
        "creee",
        "paiement_en_attente",
        "payee",
        "preparation",
        "prete",
        "en_livraison",
        "livree",
        "annulee",
        "remboursee",
        "litige",
      ],
      payment_method: ["especes", "mtn_momo", "moov_money", "virement", "cheque"],
      payment_provider: ["mtn_momo", "moov_money", "paydunya", "bankly", "cmi", "paystack"],
      payment_transaction_status: ["initiee", "en_attente", "confirmee", "echouee", "annulee"],
      payment_type: ["comptant", "acompte", "partiel", "solde"],
      project_status: ["planifie", "en_cours", "suspendu", "termine"],
      quote_status: ["en_attente", "accepte", "rejete", "converti"],
      reserve_priority: ["basse", "moyenne", "haute", "critique"],
      reserve_status: ["ouverte", "en_cours", "resolue", "annulee"],
      review_target: ["store", "product", "driver"],
      notification_channel: ["in_app", "email", "push", "sms", "whatsapp"],
      notification_kind: [
        "alerte",
        "commande",
        "livraison",
        "paiement",
        "devis",
        "rapport",
        "litige",
        "verification",
        "assistant",
      ],
      verification_doc_type: [
        "identite",
        "rccm",
        "patente",
        "cnps",
        "quittance",
        "permis",
        "diplome",
      ],
      verification_status: ["en_attente", "approuve", "rejete"],
    },
  },
} as const;
