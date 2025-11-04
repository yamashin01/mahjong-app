import type { EventRow } from "./index";

/**
 * イベントルール設定の型定義
 * EventRowから必要なルールフィールドのみを抽出
 */
export type EventRules = Pick<
  EventRow,
  | "game_type"
  | "start_points"
  | "return_points"
  | "uma_first"
  | "uma_second"
  | "uma_third"
  | "uma_fourth"
  | "oka_enabled"
  | "rate"
  | "tobi_prize"
  | "yakuman_prize"
  | "top_prize"
>;

/**
 * イベント詳細（ルール含む）
 * database.types.tsのEventRowをベースに、完全な型安全性を確保
 */
export type EventWithRules = EventRow;

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
