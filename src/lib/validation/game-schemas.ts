import { z } from "zod";

/**
 * Game validation schemas
 * Defines validation rules for game-related inputs
 */

// ゲームタイプ
export const GameTypeSchema = z.enum(["tonpuu", "tonnan"]);

// 座席
export const SeatSchema = z.enum(["east", "south", "west", "north"]);

// プレイヤーの最終点数制約
const GAME_LIMITS = {
  MIN_FINAL_POINTS: -100_000,
  MAX_FINAL_POINTS: 200_000,
  MIN_RATE: 0.1,
  MAX_RATE: 10.0,
} as const;

// 単一プレイヤーの入力スキーマ
export const PlayerInputSchema = z.object({
  playerId: z.string().min(1, "プレイヤーIDは必須です"),
  finalPoints: z
    .number()
    .int("点数は整数である必要があります")
    .min(
      GAME_LIMITS.MIN_FINAL_POINTS,
      `最終点数は${GAME_LIMITS.MIN_FINAL_POINTS}以上である必要があります`,
    )
    .max(
      GAME_LIMITS.MAX_FINAL_POINTS,
      `最終点数は${GAME_LIMITS.MAX_FINAL_POINTS}以下である必要があります`,
    ),
});

// ゲーム作成の入力スキーマ
export const CreateGameInputSchema = z.object({
  groupId: z.string().uuid("無効なグループIDです"),
  gameType: GameTypeSchema,
  eventId: z.string().uuid("無効なイベントIDです").nullable().optional(),
  players: z.array(PlayerInputSchema).length(4, "プレイヤーは必ず4人である必要があります"),
});

// ゲーム更新の入力スキーマ
export const UpdateGameInfoSchema = z.object({
  gameId: z.string().uuid("無効なゲームIDです"),
  tobiPlayerId: z.string().nullable().optional(),
  tobiGuestPlayerId: z.string().uuid().nullable().optional(),
  yakumanCount: z
    .number()
    .int("役満回数は整数である必要があります")
    .min(0, "役満回数は0以上である必要があります")
    .max(10, "役満回数は10以下である必要があります"),
});

// ゲーム結果更新の入力スキーマ
export const UpdateGameResultSchema = z.object({
  gameId: z.string().uuid("無効なゲームIDです"),
  playerId: z.string().nullable().optional(),
  guestPlayerId: z.string().uuid().nullable().optional(),
  seat: SeatSchema,
  finalPoints: z
    .number()
    .int("点数は整数である必要があります")
    .min(
      GAME_LIMITS.MIN_FINAL_POINTS,
      `最終点数は${GAME_LIMITS.MIN_FINAL_POINTS}以上である必要があります`,
    )
    .max(
      GAME_LIMITS.MAX_FINAL_POINTS,
      `最終点数は${GAME_LIMITS.MAX_FINAL_POINTS}以下である必要があります`,
    ),
});

// Type exports
export type GameType = z.infer<typeof GameTypeSchema>;
export type Seat = z.infer<typeof SeatSchema>;
export type PlayerInput = z.infer<typeof PlayerInputSchema>;
export type CreateGameInput = z.infer<typeof CreateGameInputSchema>;
export type UpdateGameInfo = z.infer<typeof UpdateGameInfoSchema>;
export type UpdateGameResult = z.infer<typeof UpdateGameResultSchema>;

// Constants export
export { GAME_LIMITS };
