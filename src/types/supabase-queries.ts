/**
 * Type definitions for common Supabase query results
 * Eliminates the need for 'as any' type assertions
 */

// Profile types
export type Profile = {
  display_name: string | null;
  avatar_url: string | null;
};

export type GuestPlayer = {
  name: string;
};

// Group member types
export type GroupMember = {
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
  profiles: Profile | null;
};

// Game result types
export type GameResult = {
  id: string;
  game_id: string;
  player_id: string | null;
  guest_player_id: string | null;
  seat: string;
  final_points: number;
  raw_score: number;
  uma: number;
  rank: number;
  total_score: number;
  point_amount: number;
  created_at: string;
  profiles: Profile | null;
  guest_players: GuestPlayer | null;
};

// Game types
export type Game = {
  id: string;
  group_id: string;
  game_type: string; // "tonpuu" | "tonnan" but Supabase returns as string
  game_number: number;
  played_at: string;
  recorded_by: string;
  tobi_player_id: string | null;
  tobi_guest_player_id: string | null;
  yakuman_count: number | null;
  created_at: string;
  updated_at: string;
};

export type GameWithResults = Game & {
  game_results: Array<{
    rank: number;
    profiles: Profile | null;
    guest_players: GuestPlayer | null;
  }>;
};

// Group types
export type GroupRules = {
  id: string;
  group_id: string;
  game_type: string;
  start_points: number;
  return_points: number;
  rate: number;
  uma_first: number;
  uma_second: number;
  uma_third: number;
  uma_fourth: number;
  oka_enabled: boolean;
  top_prize: number | null;
  tobi_prize: number | null;
  yakuman_prize: number | null;
  created_at: string;
  updated_at: string;
};

export type Group = {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

// Ranking types
export type DailyRanking = {
  player_id: string | null;
  group_id: string | null;
  game_date: string | null;
  display_name: string | null;
  games_played: number | null;
  total_points: number | null;
  average_rank: number | null;
  first_place_count: number | null;
  second_place_count: number | null;
  third_place_count: number | null;
  fourth_place_count: number | null;
};

// Helper type for player display (handles both profiles and guest_players)
export type PlayerWithName = {
  profiles?: Profile | null;
  guest_players?: GuestPlayer | null;
};
