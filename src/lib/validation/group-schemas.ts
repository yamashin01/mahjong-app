import { z } from "zod";

/**
 * Group validation schemas
 * Defines validation rules for group-related inputs
 */

// グループ作成の入力スキーマ
export const CreateGroupInputSchema = z.object({
  name: z
    .string()
    .min(1, "グループ名は必須です")
    .max(100, "グループ名は100文字以内である必要があります"),
  description: z.string().max(500, "説明は500文字以内である必要があります").optional(),
});

// グループ参加の入力スキーマ
export const JoinGroupInputSchema = z.object({
  inviteCode: z
    .string()
    .length(8, "招待コードは8文字である必要があります")
    .regex(/^[A-Z0-9]+$/, "招待コードは大文字の英数字のみです"),
});

// グループ名更新の入力スキーマ
export const UpdateGroupNameSchema = z.object({
  groupId: z.string().uuid("無効なグループIDです"),
  name: z
    .string()
    .min(1, "グループ名は必須です")
    .max(100, "グループ名は100文字以内である必要があります"),
});

// グループ説明更新の入力スキーマ
export const UpdateGroupDescriptionSchema = z.object({
  groupId: z.string().uuid("無効なグループIDです"),
  description: z.string().max(500, "説明は500文字以内である必要があります"),
});

// メンバー削除の入力スキーマ
export const RemoveMemberSchema = z.object({
  groupId: z.string().uuid("無効なグループIDです"),
  memberId: z.string().uuid("無効なメンバーIDです"),
});

// メンバーロール更新の入力スキーマ
export const UpdateMemberRoleSchema = z.object({
  groupId: z.string().uuid("無効なグループIDです"),
  memberId: z.string().uuid("無効なメンバーIDです"),
  role: z.enum(["owner", "admin", "member"], {
    message: "無効なロールです",
  }),
});

// グループルール更新の入力スキーマ
export const UpdateGroupRulesSchema = z.object({
  groupId: z.string().uuid("無効なグループIDです"),
  gameType: z.enum(["tonpuu", "tonnan"]),
  startPoints: z
    .number()
    .int("開始点は整数である必要があります")
    .min(10000, "開始点は10000以上である必要があります")
    .max(50000, "開始点は50000以下である必要があります"),
  returnPoints: z
    .number()
    .int("返し点は整数である必要があります")
    .min(10000, "返し点は10000以上である必要があります")
    .max(50000, "返し点は50000以下である必要があります"),
  umaFirst: z.number().int("ウマは整数である必要があります"),
  umaSecond: z.number().int("ウマは整数である必要があります"),
  umaThird: z.number().int("ウマは整数である必要があります"),
  umaFourth: z.number().int("ウマは整数である必要があります"),
  okaEnabled: z.boolean(),
  rate: z
    .number()
    .min(0.1, "レートは0.1以上である必要があります")
    .max(10.0, "レートは10.0以下である必要があります"),
  tobiPrize: z
    .number()
    .int("トビ賞は整数である必要があります")
    .min(0, "トビ賞は0以上である必要があります"),
  yakumanPrize: z
    .number()
    .int("役満賞は整数である必要があります")
    .min(0, "役満賞は0以上である必要があります"),
  yakitoriPrize: z
    .number()
    .int("役満賞は整数である必要があります")
    .min(0, "役満賞は0以上である必要があります"),
  topPrize: z
    .number()
    .int("トップ賞は整数である必要があります")
    .min(0, "トップ賞は0以上である必要があります"),
});

// Type exports
export type CreateGroupInput = z.infer<typeof CreateGroupInputSchema>;
export type JoinGroupInput = z.infer<typeof JoinGroupInputSchema>;
export type UpdateGroupName = z.infer<typeof UpdateGroupNameSchema>;
export type UpdateGroupDescription = z.infer<typeof UpdateGroupDescriptionSchema>;
export type RemoveMember = z.infer<typeof RemoveMemberSchema>;
export type UpdateMemberRole = z.infer<typeof UpdateMemberRoleSchema>;
export type UpdateGroupRules = z.infer<typeof UpdateGroupRulesSchema>;
