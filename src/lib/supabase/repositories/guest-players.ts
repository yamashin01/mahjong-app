import { createClient } from "@/lib/supabase/server";

/**
 * ゲストプレイヤーを追加する
 */
export async function addGuestPlayer(params: {
  groupId: string;
  name: string;
}) {
  const supabase = await createClient();
  return await supabase.from("guest_players").insert({
    group_id: params.groupId,
    name: params.name,
  });
}

/**
 * ゲストプレイヤーを削除する
 */
export async function deleteGuestPlayer(params: {
  guestPlayerId: string;
  groupId: string;
}) {
  const supabase = await createClient();
  return await supabase
    .from("guest_players")
    .delete()
    .eq("id", params.guestPlayerId)
    .eq("group_id", params.groupId);
}

/**
 * グループのゲストプレイヤー一覧を取得する
 */
export async function getGroupGuestPlayers(groupId: string) {
  const supabase = await createClient();
  return await supabase
    .from("guest_players")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });
}

/**
 * ゲストプレイヤーの名前のみを取得する
 */
export async function getGuestPlayerName(guestPlayerId: string) {
  const supabase = await createClient();
  return await supabase
    .from("guest_players")
    .select("name")
    .eq("id", guestPlayerId)
    .single();
}
