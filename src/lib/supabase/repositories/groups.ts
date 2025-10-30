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
  return await supabase
    .from("groups")
    .select("id")
    .eq("invite_code", inviteCode)
    .single();
}

/**
 * グループメンバーシップを確認する
 */
export async function findGroupMember(params: {
  groupId: string;
  userId: string;
}) {
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
export async function removeGroupMember(params: {
  groupId: string;
  userId: string;
}) {
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
}) {
  const supabase = await createClient();
  return await supabase
    .from("group_rules")
    .update({
      game_type: params.gameType,
      start_points: params.startPoints,
      return_points: params.returnPoints,
      rate: params.rate,
      uma_first: params.umaFirst,
      uma_second: params.umaSecond,
      uma_third: params.umaThird,
      uma_fourth: params.umaFourth,
    })
    .eq("group_id", params.groupId);
}

/**
 * グループルールを取得する
 */
export async function getGroupRules(groupId: string) {
  const supabase = await createClient();
  return await supabase
    .from("group_rules")
    .select("*")
    .eq("group_id", groupId)
    .single();
}
