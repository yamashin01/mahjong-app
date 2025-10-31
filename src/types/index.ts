/**
 * Centralized type definitions for the mahjong application
 *
 * Type Hierarchy:
 * 1. Base Types (DB直結) - database.types.tsから自動取得
 * 2. Query Types (Join結果) - リレーションを含むクエリ結果
 * 3. Domain Types (ビジネスロジック) - アプリ固有のドメイン型
 */

import type { Database } from './database.types';

// ============================================================================
// 1. BASE TYPES - Database Table Types (Single Source of Truth)
// ============================================================================

/**
 * Base table row types - directly from database schema
 * These are the foundation types that reflect actual database structure
 */
export type EventRow = Database['public']['Tables']['events']['Row'];
export type GameResultRow = Database['public']['Tables']['game_results']['Row'];
export type GameRow = Database['public']['Tables']['games']['Row'];
export type GroupMemberRow = Database['public']['Tables']['group_members']['Row'];
export type GroupRulesRow = Database['public']['Tables']['group_rules']['Row'];
export type GroupRow = Database['public']['Tables']['groups']['Row'];
export type GuestPlayerRow = Database['public']['Tables']['guest_players']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

/**
 * Insert types - for creating new records
 * These include optional fields with defaults
 */
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type GameResultInsert = Database['public']['Tables']['game_results']['Insert'];
export type GameInsert = Database['public']['Tables']['games']['Insert'];
export type GroupMemberInsert = Database['public']['Tables']['group_members']['Insert'];
export type GroupRulesInsert = Database['public']['Tables']['group_rules']['Insert'];
export type GroupInsert = Database['public']['Tables']['groups']['Insert'];
export type GuestPlayerInsert = Database['public']['Tables']['guest_players']['Insert'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

/**
 * Update types - for updating existing records
 * All fields are optional
 */
export type EventUpdate = Database['public']['Tables']['events']['Update'];
export type GameResultUpdate = Database['public']['Tables']['game_results']['Update'];
export type GameUpdate = Database['public']['Tables']['games']['Update'];
export type GroupMemberUpdate = Database['public']['Tables']['group_members']['Update'];
export type GroupRulesUpdate = Database['public']['Tables']['group_rules']['Update'];
export type GroupUpdate = Database['public']['Tables']['groups']['Update'];
export type GuestPlayerUpdate = Database['public']['Tables']['guest_players']['Update'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// ============================================================================
// 2. QUERY TYPES - Types with Relations (Join Results)
// ============================================================================

/**
 * Minimal profile data for display purposes
 * Used in joined queries to avoid fetching unnecessary fields
 */
export type ProfileDisplay = Pick<ProfileRow, 'display_name' | 'avatar_url'>;

/**
 * Minimal guest player data for display
 */
export type GuestPlayerDisplay = Pick<GuestPlayerRow, 'name'>;

/**
 * Game result with player information (profiles or guest_players joined)
 */
export type GameResultWithPlayer = GameResultRow & {
  profiles: ProfileDisplay | null;
  guest_players: GuestPlayerDisplay | null;
};

/**
 * Game with all result details
 */
export type GameWithResults = GameRow & {
  game_results: Array<{
    rank: number;
    profiles: ProfileDisplay | null;
    guest_players: GuestPlayerDisplay | null;
  }>;
};

/**
 * Group member with profile information
 */
export type GroupMemberWithProfile = GroupMemberRow & {
  profiles: ProfileDisplay | null;
};

/**
 * Flexible player data type for utility functions
 * Handles both regular players and guest players
 */
export type FlexiblePlayerData = {
  profiles?: { display_name?: string | null; avatar_url?: string | null } | null;
  guest_players?: { name?: string } | null;
};

// ============================================================================
// 3. DOMAIN TYPES - Application-Specific Business Logic Types
// ============================================================================

/**
 * Group membership for authorization checks
 * Used by access control utilities
 * Note: role is refined to literal union type for type safety
 */
export type GroupMembership = Omit<
  Pick<GroupMemberRow, 'user_id' | 'group_id' | 'joined_at'>,
  never
> & {
  role: 'admin' | 'member';
};

/**
 * Ranking data for display components
 * Represents aggregated player statistics
 */
export type RankingData = {
  player_id: string | null;
  display_name: string | null;
  games_played: number | null;
  first_place_count: number | null;
  second_place_count: number | null;
  third_place_count: number | null;
  fourth_place_count: number | null;
  average_rank: number | null;
  total_points: number | null;
  game_date: string | null;
  group_id: string | null;
};

/**
 * Daily ranking data from database view
 * Used for today's ranking display
 */
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

// ============================================================================
// LEGACY EXPORTS - Backward Compatibility
// ============================================================================
// These exports maintain compatibility with existing code
// Consider migrating to the base types above for better type safety

/**
 * @deprecated Use ProfileDisplay instead
 */
export type Profile = ProfileDisplay;

/**
 * @deprecated Use GuestPlayerDisplay instead
 */
export type GuestPlayer = GuestPlayerDisplay;

/**
 * @deprecated Use GroupMemberWithProfile instead
 */
export type GroupMember = GroupMemberWithProfile;

/**
 * @deprecated Use GameResultWithPlayer instead
 */
export type GameResult = GameResultWithPlayer;

/**
 * @deprecated Use GameRow instead
 */
export type Game = GameRow;

/**
 * @deprecated Use GroupRulesRow instead
 */
export type GroupRules = GroupRulesRow;

/**
 * @deprecated Use GroupRow instead
 */
export type Group = GroupRow;

/**
 * @deprecated Use FlexiblePlayerData (already defined above)
 */
export type PlayerWithName = FlexiblePlayerData;
