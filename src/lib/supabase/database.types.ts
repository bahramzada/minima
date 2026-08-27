export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          streak_count: number;
          last_active_date: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          streak_count?: number;
          last_active_date?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          emoji: string;
          subtitle: string;
          category: string;
          target_minutes: number;
          is_ai_generated: boolean;
          is_daily_task: boolean;
          source_date: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          emoji?: string;
          subtitle?: string;
          category?: string;
          target_minutes?: number;
          is_ai_generated?: boolean;
          is_daily_task?: boolean;
          source_date?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["habits"]["Insert"]>;
        Relationships: [];
      };
      habit_logs: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id: string;
          completed_at: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["habit_logs"]["Insert"]>;
        Relationships: [];
      };
      mood_logs: {
        Row: {
          id: string;
          user_id: string;
          mood_emoji: string;
          mood_level: number;
          logged_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood_emoji: string;
          mood_level: number;
          logged_date: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mood_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      delete_own_account: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
