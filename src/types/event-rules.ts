/**
 * イベントルール設定の型定義
 */
export interface EventRules {
  game_type?: "tonpuu" | "tonnan";
  start_points?: number;
  return_points?: number;
  uma_first?: number;
  uma_second?: number;
  uma_third?: number;
  uma_fourth?: number;
  oka_enabled?: boolean;
  rate?: number;
  tobi_prize?: number;
  yakuman_prize?: number;
  top_prize?: number;
}

/**
 * イベント詳細（ルール含む）
 */
export interface EventWithRules {
  id: string;
  group_id: string;
  name: string;
  description: string | null;
  event_date: string;
  status: "active" | "completed";
  created_by: string;
  created_at: string;
  updated_at: string;
  // ルール設定
  game_type?: "tonpuu" | "tonnan" | null;
  start_points?: number | null;
  return_points?: number | null;
  uma_first?: number | null;
  uma_second?: number | null;
  uma_third?: number | null;
  uma_fourth?: number | null;
  oka_enabled?: boolean | null;
  rate?: number | null;
  tobi_prize?: number | null;
  yakuman_prize?: number | null;
  top_prize?: number | null;
}

/**
 * イベント作成時のフォームデータ
 */
export interface CreateEventFormData {
  groupId: string;
  name: string;
  description?: string;
  eventDate: string;
  // ルール設定（オプショナル）
  useCustomRules?: boolean;
  game_type?: "tonpuu" | "tonnan";
  start_points?: number;
  return_points?: number;
  uma_first?: number;
  uma_second?: number;
  uma_third?: number;
  uma_fourth?: number;
  oka_enabled?: boolean;
  rate?: number;
  tobi_prize?: number;
  yakuman_prize?: number;
  top_prize?: number;
}
