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
