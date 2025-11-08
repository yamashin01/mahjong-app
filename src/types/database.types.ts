export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string;
          created_by: string;
          description: string | null;
          event_date: string;
          game_type: string | null;
          group_id: string;
          id: string;
          name: string;
          oka_enabled: boolean | null;
          rate: number | null;
          return_points: number | null;
          start_points: number | null;
          status: string;
          tobi_prize: number | null;
          top_prize: number | null;
          uma_first: number | null;
          uma_fourth: number | null;
          uma_second: number | null;
          uma_third: number | null;
          updated_at: string;
          yakitori_prize: number | null;
          yakuman_prize: number | null;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description?: string | null;
          event_date: string;
          game_type?: string | null;
          group_id: string;
          id?: string;
          name: string;
          oka_enabled?: boolean | null;
          rate?: number | null;
          return_points?: number | null;
          start_points?: number | null;
          status?: string;
          tobi_prize?: number | null;
          top_prize?: number | null;
          uma_first?: number | null;
          uma_fourth?: number | null;
          uma_second?: number | null;
          uma_third?: number | null;
          updated_at?: string;
          yakitori_prize?: number | null;
          yakuman_prize?: number | null;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          description?: string | null;
          event_date?: string;
          game_type?: string | null;
          group_id?: string;
          id?: string;
          name?: string;
          oka_enabled?: boolean | null;
          rate?: number | null;
          return_points?: number | null;
          start_points?: number | null;
          status?: string;
          tobi_prize?: number | null;
          top_prize?: number | null;
          uma_first?: number | null;
          uma_fourth?: number | null;
          uma_second?: number | null;
          uma_third?: number | null;
          updated_at?: string;
          yakitori_prize?: number | null;
          yakuman_prize?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
        ];
      };
      game_results: {
        Row: {
          created_at: string;
          final_points: number;
          game_id: string;
          guest_player_id: string | null;
          id: string;
          oka: number;
          player_id: string | null;
          point_amount: number;
          rank: number;
          raw_score: number;
          seat: string;
          total_score: number;
          uma: number;
        };
        Insert: {
          created_at?: string;
          final_points: number;
          game_id: string;
          guest_player_id?: string | null;
          id?: string;
          oka?: number;
          player_id?: string | null;
          point_amount: number;
          rank: number;
          raw_score: number;
          seat: string;
          total_score: number;
          uma: number;
        };
        Update: {
          created_at?: string;
          final_points?: number;
          game_id?: string;
          guest_player_id?: string | null;
          id?: string;
          oka?: number;
          player_id?: string | null;
          point_amount?: number;
          rank?: number;
          raw_score?: number;
          seat?: string;
          total_score?: number;
          uma?: number;
        };
        Relationships: [
          {
            foreignKeyName: "game_results_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_results_guest_player_id_fkey";
            columns: ["guest_player_id"];
            isOneToOne: false;
            referencedRelation: "guest_players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_results_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      games: {
        Row: {
          created_at: string;
          custom_rate: number | null;
          custom_return_points: number | null;
          custom_start_points: number | null;
          custom_uma_first: number | null;
          custom_uma_fourth: number | null;
          custom_uma_second: number | null;
          custom_uma_third: number | null;
          event_id: string | null;
          game_number: number;
          game_type: string;
          group_id: string;
          id: string;
          played_at: string;
          recorded_by: string;
          tobi_guest_player_id: string | null;
          tobi_player_id: string | null;
          updated_at: string;
          yakuman_count: number | null;
        };
        Insert: {
          created_at?: string;
          custom_rate?: number | null;
          custom_return_points?: number | null;
          custom_start_points?: number | null;
          custom_uma_first?: number | null;
          custom_uma_fourth?: number | null;
          custom_uma_second?: number | null;
          custom_uma_third?: number | null;
          event_id?: string | null;
          game_number: number;
          game_type: string;
          group_id: string;
          id?: string;
          played_at?: string;
          recorded_by: string;
          tobi_guest_player_id?: string | null;
          tobi_player_id?: string | null;
          updated_at?: string;
          yakuman_count?: number | null;
        };
        Update: {
          created_at?: string;
          custom_rate?: number | null;
          custom_return_points?: number | null;
          custom_start_points?: number | null;
          custom_uma_first?: number | null;
          custom_uma_fourth?: number | null;
          custom_uma_second?: number | null;
          custom_uma_third?: number | null;
          event_id?: string | null;
          game_number?: number;
          game_type?: string;
          group_id?: string;
          id?: string;
          played_at?: string;
          recorded_by?: string;
          tobi_guest_player_id?: string | null;
          tobi_player_id?: string | null;
          updated_at?: string;
          yakuman_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "games_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "games_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "games_tobi_guest_player_id_fkey";
            columns: ["tobi_guest_player_id"];
            isOneToOne: false;
            referencedRelation: "guest_players";
            referencedColumns: ["id"];
          },
        ];
      };
      group_members: {
        Row: {
          group_id: string;
          id: string;
          joined_at: string;
          role: string;
          user_id: string;
        };
        Insert: {
          group_id: string;
          id?: string;
          joined_at?: string;
          role?: string;
          user_id: string;
        };
        Update: {
          group_id?: string;
          id?: string;
          joined_at?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      group_rules: {
        Row: {
          created_at: string;
          game_type: string;
          group_id: string;
          id: string;
          oka_enabled: boolean;
          rate: number;
          return_points: number;
          start_points: number;
          tobi_prize: number | null;
          top_prize: number | null;
          uma_first: number;
          uma_fourth: number;
          uma_second: number;
          uma_third: number;
          updated_at: string;
          yakitori_prize: number | null;
          yakuman_prize: number | null;
        };
        Insert: {
          created_at?: string;
          game_type?: string;
          group_id: string;
          id?: string;
          oka_enabled?: boolean;
          rate?: number;
          return_points?: number;
          start_points?: number;
          tobi_prize?: number | null;
          top_prize?: number | null;
          uma_first?: number;
          uma_fourth?: number;
          uma_second?: number;
          uma_third?: number;
          updated_at?: string;
          yakitori_prize?: number | null;
          yakuman_prize?: number | null;
        };
        Update: {
          created_at?: string;
          game_type?: string;
          group_id?: string;
          id?: string;
          oka_enabled?: boolean;
          rate?: number;
          return_points?: number;
          start_points?: number;
          tobi_prize?: number | null;
          top_prize?: number | null;
          uma_first?: number;
          uma_fourth?: number;
          uma_second?: number;
          uma_third?: number;
          updated_at?: string;
          yakitori_prize?: number | null;
          yakuman_prize?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "group_rules_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: true;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
        ];
      };
      groups: {
        Row: {
          created_at: string;
          created_by: string;
          description: string | null;
          id: string;
          invite_code: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description?: string | null;
          id?: string;
          invite_code?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          description?: string | null;
          id?: string;
          invite_code?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      guest_players: {
        Row: {
          created_at: string | null;
          group_id: string;
          id: string;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          group_id: string;
          id?: string;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          group_id?: string;
          id?: string;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "guest_players_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      daily_rankings: {
        Row: {
          average_rank: number | null;
          display_name: string | null;
          first_place_count: number | null;
          fourth_place_count: number | null;
          game_date: string | null;
          games_played: number | null;
          group_id: string | null;
          player_id: string | null;
          second_place_count: number | null;
          third_place_count: number | null;
          total_points: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "game_results_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "games_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
        ];
      };
      group_statistics: {
        Row: {
          average_points: number | null;
          average_rank: number | null;
          display_name: string | null;
          first_place_count: number | null;
          first_place_rate: number | null;
          fourth_place_count: number | null;
          group_id: string | null;
          last_played_at: string | null;
          player_id: string | null;
          second_place_count: number | null;
          third_place_count: number | null;
          tobi_count: number | null;
          total_games: number | null;
          total_points: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "game_results_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "games_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      generate_invite_code: { Args: never; Returns: string };
      is_group_admin: {
        Args: { p_group_id: string; p_user_id: string };
        Returns: boolean;
      };
      is_group_member: {
        Args: { p_group_id: string; p_user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
