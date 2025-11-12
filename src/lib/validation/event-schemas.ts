import { z } from "zod";

/**
 * Event validation schemas
 * Defines validation rules for event-related inputs
 */

// イベントステータス (repositoryの型に合わせる)
export const EventStatusSchema = z.enum(["active", "completed"]);

// イベント作成の入力スキーマ
export const CreateEventInputSchema = z.object({
  groupId: z.string().uuid("無効なグループIDです"),
  name: z
    .string()
    .min(1, "イベント名は必須です")
    .max(100, "イベント名は100文字以内である必要があります"),
  description: z.string().max(500, "説明は500文字以内である必要があります").optional(),
  startDate: z.string().datetime("無効な日時形式です"),
  endDate: z.string().datetime("無効な日時形式です").optional().nullable(),
});

// イベント名更新の入力スキーマ
export const UpdateEventNameSchema = z.object({
  eventId: z.string().uuid("無効なイベントIDです"),
  name: z
    .string()
    .min(1, "イベント名は必須です")
    .max(100, "イベント名は100文字以内である必要があります"),
});

// イベント説明更新の入力スキーマ
export const UpdateEventDescriptionSchema = z.object({
  eventId: z.string().uuid("無効なイベントIDです"),
  description: z.string().max(500, "説明は500文字以内である必要があります"),
});

// イベントステータス更新の入力スキーマ
export const UpdateEventStatusSchema = z.object({
  eventId: z.string().uuid("無効なイベントIDです"),
  status: EventStatusSchema,
});

// イベントルール更新の入力スキーマ（グループルールと同じ構造）
export const UpdateEventRulesSchema = z.object({
  eventId: z.string().uuid("無効なイベントIDです"),
  gameType: z.enum(["tonpuu", "tonnan"]).nullable().optional(),
  startPoints: z
    .number()
    .int("開始点は整数である必要があります")
    .min(10000, "開始点は10000以上である必要があります")
    .max(50000, "開始点は50000以下である必要があります")
    .nullable()
    .optional(),
  returnPoints: z
    .number()
    .int("返し点は整数である必要があります")
    .min(10000, "返し点は10000以上である必要があります")
    .max(50000, "返し点は50000以下である必要があります")
    .nullable()
    .optional(),
  umaFirst: z.number().int("ウマは整数である必要があります").nullable().optional(),
  umaSecond: z.number().int("ウマは整数である必要があります").nullable().optional(),
  umaThird: z.number().int("ウマは整数である必要があります").nullable().optional(),
  umaFourth: z.number().int("ウマは整数である必要があります").nullable().optional(),
  okaEnabled: z.boolean().nullable().optional(),
  rate: z
    .number()
    .min(0.1, "レートは0.1以上である必要があります")
    .max(10.0, "レートは10.0以下である必要があります")
    .nullable()
    .optional(),
  tobiPrize: z
    .number()
    .int("トビ賞は整数である必要があります")
    .min(0, "トビ賞は0以上である必要があります")
    .nullable()
    .optional(),
  yakumanPrize: z
    .number()
    .int("役満賞は整数である必要があります")
    .min(0, "役満賞は0以上である必要があります")
    .nullable()
    .optional(),
  yakitoriPrize: z
    .number()
    .int("ヤキトリ賞は整数である必要があります")
    .min(0, "ヤキトリ賞は0以上である必要があります")
    .nullable()
    .optional(),
  topPrize: z
    .number()
    .int("トップ賞は整数である必要があります")
    .min(0, "トップ賞は0以上である必要があります")
    .nullable()
    .optional(),
});

// Type exports
export type EventStatus = z.infer<typeof EventStatusSchema>;
export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;
export type UpdateEventName = z.infer<typeof UpdateEventNameSchema>;
export type UpdateEventDescription = z.infer<typeof UpdateEventDescriptionSchema>;
export type UpdateEventStatus = z.infer<typeof UpdateEventStatusSchema>;
export type UpdateEventRules = z.infer<typeof UpdateEventRulesSchema>;
