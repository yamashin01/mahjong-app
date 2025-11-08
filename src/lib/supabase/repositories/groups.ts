import { createClient } from "@/lib/supabase/server";

/**
 * グループを作成する
 */
export async function createGroup(params: {
  name: string;
  description: string | null;
  createdBy: string;
}) {
  const supabase = await createClient();
  return await supabase
    .from("groups")
    .insert({
      name: params.name,
      description: params.description,
      created_by: params.createdBy,
    })
    .select()
    .single();
}

/**
 * 招待コードでグループを検索する
 */
export async function findGroupByInviteCode(inviteCode: string) {
  const supabase = await createClient();
  return await supabase.from("groups").select("id").eq("invite_code", inviteCode).single();
}

/**
 * グループメンバーシップを確認する
 */
export async function findGroupMember(params: { groupId: string; userId: string }) {
  const supabase = await createClient();
  return await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", params.groupId)
    .eq("user_id", params.userId)
    .single();
}

/**
 * グループメンバーを追加する
 */
export async function addGroupMember(params: {
  groupId: string;
  userId: string;
  role: "admin" | "member";
}) {
  const supabase = await createClient();
  return await supabase.from("group_members").insert({
    group_id: params.groupId,
    user_id: params.userId,
    role: params.role,
  });
}

/**
 * グループメンバーを削除する
 */
export async function removeGroupMember(params: { groupId: string; userId: string }) {
  const supabase = await createClient();
  return await supabase
    .from("group_members")
    .delete()
    .eq("group_id", params.groupId)
    .eq("user_id", params.userId);
}

/**
 * グループメンバーのロールを更新する
 */
export async function updateMemberRole(params: {
  groupId: string;
  userId: string;
  role: "admin" | "member";
}) {
  const supabase = await createClient();
  return await supabase
    .from("group_members")
    .update({ role: params.role })
    .eq("group_id", params.groupId)
    .eq("user_id", params.userId);
}

/**
 * グループルールを更新する
 */
export async function updateGroupRules(params: {
  groupId: string;
  gameType: "tonpuu" | "tonnan";
  startPoints: number;
  returnPoints: number;
  rate: number;
  umaFirst: number;
  umaSecond: number;
  umaThird: number;
  umaFourth: number;
  tobiPrize: number | null;
  yakumanPrize: number | null;
  yakitoriPrize: number | null;
}) {
  const supabase = await createClient();

  // オカは返し点が開始点より大きい場合に自動的に有効
  const okaEnabled = params.returnPoints > params.startPoints;

  return await supabase
    .from("group_rules")
    .update({
      game_type: params.gameType,
      start_points: params.startPoints,
      return_points: params.returnPoints,
      oka_enabled: okaEnabled,
      rate: params.rate,
      uma_first: params.umaFirst,
      uma_second: params.umaSecond,
      uma_third: params.umaThird,
      uma_fourth: params.umaFourth,
      tobi_prize: params.tobiPrize,
      yakuman_prize: params.yakumanPrize,
      yakitori_prize: params.yakitoriPrize,
    })
    .eq("group_id", params.groupId);
}

/**
 * グループルールを取得する
 */
export async function getGroupRules(groupId: string) {
  const supabase = await createClient();
  return await supabase.from("group_rules").select("*").eq("group_id", groupId).single();
}

/**
 * グループ情報を取得する
 */
export async function getGroupById(groupId: string) {
  const supabase = await createClient();
  return await supabase.from("groups").select("*").eq("id", groupId).single();
}

/**
 * グループ名を取得する
 */
export async function getGroupName(groupId: string) {
  const supabase = await createClient();
  return await supabase.from("groups").select("name").eq("id", groupId).single();
}

/**
 * グループメンバー一覧を取得する
 */
export async function getGroupMembers(groupId: string) {
  const supabase = await createClient();
  return await supabase
    .from("group_members")
    .select(
      `
      user_id,
      role,
      joined_at,
      profiles (
        display_name,
        avatar_url
      )
    `,
    )
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });
}

/**
 * ユーザーが参加しているグループ一覧を取得する
 */
export async function getUserGroups(userId: string) {
  const supabase = await createClient();
  return await supabase
    .from("group_members")
    .select(
      `
      group_id,
      role,
      joined_at,
      groups (
        id,
        name,
        description,
        invite_code,
        created_at
      )
    `,
    )
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });
}

/**
 * グループメンバー数を確認する
 */
export async function getGroupMemberCount(groupId: string) {
  const supabase = await createClient();
  return await supabase
    .from("group_members")
    .select("user_id", { count: "exact", head: true })
    .eq("group_id", groupId);
}

/**
 * グループメンバーの表示名一覧を取得する（ゲーム記録用）
 */
export async function getGroupMemberNames(groupId: string) {
  const supabase = await createClient();
  return await supabase
    .from("group_members")
    .select(
      `
      user_id,
      profiles (
        display_name
      )
    `,
    )
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });
}

/**
 * グループ名を更新する
 */
export async function updateGroupName(params: { groupId: string; name: string }) {
  const supabase = await createClient();
  return await supabase.from("groups").update({ name: params.name }).eq("id", params.groupId);
}
