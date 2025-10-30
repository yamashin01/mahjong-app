import { createClient } from "@/lib/supabase/server";

/**
 * プロフィールを更新する
 */
export async function updateProfile(params: {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  const supabase = await createClient();
  return await supabase
    .from("profiles")
    .update({
      display_name: params.displayName,
      avatar_url: params.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.userId);
}

/**
 * プロフィールを取得する
 */
export async function getProfileById(userId: string) {
  const supabase = await createClient();
  return await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
}

/**
 * ユーザーのゲーム結果統計を取得する
 */
export async function getUserGameStats(userId: string) {
  const supabase = await createClient();
  return await supabase
    .from("game_results")
    .select("rank, total_score, point_amount")
    .eq("player_id", userId)
    .order("game_id", { ascending: false });
}

/**
 * ユーザーが参加しているグループの情報を取得する
 */
export async function getUserGroupMemberships(userId: string) {
  const supabase = await createClient();
  return await supabase
    .from("group_members")
    .select(
      `
      role,
      joined_at,
      groups (
        id,
        name
      )
    `,
    )
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });
}

/**
 * プロフィールの表示名のみを取得する
 */
export async function getProfileDisplayName(userId: string) {
  const supabase = await createClient();
  return await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();
}
