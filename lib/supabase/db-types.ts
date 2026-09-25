export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      countries: {
        Row: { id: number; code: string; name: string; currency_code: string; locale: string };
        Insert: { code: string; name: string; currency_code: string; locale: string };
        Update: Partial<Database['public']['Tables']['countries']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          country_id: number;
          age_bucket: Database['public']['Enums']['age_bucket'];
          employment_status: Database['public']['Enums']['employment_status'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          country_id: number;
          age_bucket: Database['public']['Enums']['age_bucket'];
          employment_status: Database['public']['Enums']['employment_status'];
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      financial_inputs: {
        Row: {
          id: string;
          user_id: string;
          snapshot_month: string;
          income_dependiente: number;
          income_independiente: number;
          income_otros: number;
          expenses_essential: number;
          expenses_nonessential: number;
          liquid_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          snapshot_month: string;
          income_dependiente?: number;
          income_independiente?: number;
          income_otros?: number;
          expenses_essential?: number;
          expenses_nonessential?: number;
          liquid_balance?: number;
        };
        Update: Partial<Database['public']['Tables']['financial_inputs']['Insert']>;
        Relationships: [];
      };
      liabilities: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: Database['public']['Enums']['liability_type'];
          balance: number;
          monthly_payment: number;
          annual_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          type: Database['public']['Enums']['liability_type'];
          balance?: number;
          monthly_payment?: number;
          annual_rate?: number;
        };
        Update: Partial<Database['public']['Tables']['liabilities']['Insert']>;
        Relationships: [];
      };
      wellbeing_answers: {
        Row: { id: string; user_id: string; answered_at: string; items: Json; all_items_answered: boolean };
        Insert: { user_id: string; items: Json; all_items_answered: boolean };
        Update: Partial<Database['public']['Tables']['wellbeing_answers']['Insert']>;
        Relationships: [];
      };
      wellbeing_results: {
        Row: {
          id: string;
          user_id: string;
          answers_id: string;
          score: number;
          dimension_control: number;
          dimension_shock: number;
          dimension_goals: number;
          dimension_freedom: number;
          note: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          answers_id: string;
          score: number;
          dimension_control: number;
          dimension_shock: number;
          dimension_goals: number;
          dimension_freedom: number;
        };
        Update: Partial<Database['public']['Tables']['wellbeing_results']['Insert']>;
        Relationships: [];
      };
      simulations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          scenario_type: Database['public']['Enums']['scenario_type'];
          params: Json;
          result: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          scenario_type: Database['public']['Enums']['scenario_type'];
          params: Json;
          result: Json;
        };
        Update: Partial<Database['public']['Tables']['simulations']['Insert']>;
        Relationships: [];
      };
      indicators: {
        Row: {
          id: string;
          indicator_key: Database['public']['Enums']['indicator_key'];
          country_id: number;
          source_id: string;
          value: number | null;
          unit: string;
          year: number;
          fnd_code: string | null;
        };
        Insert: {
          indicator_key: Database['public']['Enums']['indicator_key'];
          country_id: number;
          source_id: string;
          value?: number | null;
          unit?: string;
          year: number;
          fnd_code?: string | null;
        };
        Update: Partial<Database['public']['Tables']['indicators']['Insert']>;
        Relationships: [];
      };
      indicator_sources: {
        Row: {
          id: string;
          source_key: string;
          name: string;
          institution: string;
          edition: string;
          data_year: number;
          methodology: string;
          url: string;
          accessed_at: string;
          notes: string | null;
        };
        Insert: {
          source_key: string;
          name: string;
          institution: string;
          edition: string;
          data_year: number;
          methodology: string;
          url: string;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['indicator_sources']['Insert']>;
        Relationships: [];
      };
      missions: {
        Row: { id: string; slug: string; title: string; description: string; sort_order: number; required_actions: Json };
        Insert: { slug: string; title: string; description: string; sort_order: number; required_actions: Json };
        Update: Partial<Database['public']['Tables']['missions']['Insert']>;
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          slug: string;
          title: string;
          summary: string;
          body: string;
          topic: Database['public']['Enums']['lesson_topic'];
          reading_minutes: number;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          title: string;
          summary: string;
          body: string;
          topic: Database['public']['Enums']['lesson_topic'];
          reading_minutes?: number;
          published?: boolean;
        };
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>;
        Relationships: [];
      };
      mission_progress: {
        Row: {
          id: string;
          user_id: string;
          mission_id: string;
          status: Database['public']['Enums']['mission_status'];
          actions_done: Json;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          mission_id: string;
          status?: Database['public']['Enums']['mission_status'];
          actions_done?: Json;
        };
        Update: Partial<Database['public']['Tables']['mission_progress']['Insert']>;
        Relationships: [];
      };
      events: {
        Row: { id: number; user_id: string | null; event_name: Database['public']['Enums']['event_name']; properties: Json; created_at: string };
        Insert: { user_id?: string | null; event_name: Database['public']['Enums']['event_name']; properties?: Json };
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
        Relationships: [];
      };
      audit_logs: {
        Row: { id: number; user_id: string; table_name: string; record_id: string; action: string; changed_at: string; data: Json };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      age_bucket: '18_61' | '62_plus';
      employment_status: 'dependiente' | 'independiente' | 'mixto' | 'estudiante' | 'sin_empleo' | 'otro';
      liability_type: 'tarjeta' | 'prestamo' | 'hipoteca' | 'vehiculo' | 'otro';
      scenario_type: 'ingresos_menos' | 'gastos_mas' | 'perdida_ingreso' | 'emergencia' | 'personalizado';
      mission_status: 'no_iniciada' | 'en_curso' | 'completada';
      lesson_topic: 'room_for_error' | 'never_enough' | 'status_consumption' | 'invisible_wealth' | 'luck_risk';
      event_name: 'onboarding_completed' | 'test_completed' | 'profile_saved' | 'simulation_created' | 'mission_completed';
      indicator_key: 'account_ownership' | 'saved_formally_last_year' | 'formal_credit_access' | 'emergency_funds';
    };
    CompositeTypes: Record<string, never>;
  };
}