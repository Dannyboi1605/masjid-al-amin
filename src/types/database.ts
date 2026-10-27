export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin" | "superadmin";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: AppRole;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: AppRole;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: AppRole;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          starts_at: string;
          ends_at: string | null;
          location: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          starts_at: string;
          ends_at?: string | null;
          location: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          location?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      org_chart: {
        Row: {
          id: boolean;
          image_path: string;
          image_width: number;
          image_height: number;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          image_path: string;
          image_width: number;
          image_height: number;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          image_path?: string;
          image_width?: number;
          image_height?: number;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: boolean;
          mosque_name: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          prayer_zone: string;
          donation_qr_path: string | null;
          donation_note: string | null;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          mosque_name: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          prayer_zone?: string;
          donation_qr_path?: string | null;
          donation_note?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          mosque_name?: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          prayer_zone?: string;
          donation_qr_path?: string | null;
          donation_note?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      prayer_times_cache: {
        Row: {
          zone: string;
          year: number;
          data: Json;
          fetched_at: string;
        };
        Insert: {
          zone: string;
          year: number;
          data: Json;
          fetched_at?: string;
        };
        Update: {
          zone?: string;
          year?: number;
          data?: Json;
          fetched_at?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          meta: Json | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          actor_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          meta?: Json | null;
          created_at?: string;
        };
        Update: {
          actor_id?: string | null;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          meta?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      auth_role: {
        Args: Record<PropertyKey, never>;
        Returns: AppRole | null;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_superadmin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
