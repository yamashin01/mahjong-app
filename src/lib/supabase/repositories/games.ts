import { createClient } from "@/lib/supabase/server";

/**
 * グループの最新ゲーム番号を取得する
 */
export async function getLatestGameNumber(groupId: string) {
  const supabase = await createClient();
  return await supabase
    .from("games")
    .select("game_number")
    .eq("group_id", groupId)
    .order("game_number", { ascending: false })
    .limit(1)
    .single();
}

/**
 * ゲームを作成する
 */
export async function createGame(gameData: {
    group_id: string;
    game_type: "tonpuu" | "tonnan";
    game_number: number;
    played_at: string;
    recorded_by: string;
    event_id: string | null;
    tobi_player_id: string | null;
    tobi_guest_player_id: string | null;
    yakuman_count: number;
  }) {
  const supabase = await createClient();
  return await supabase.from("games").insert(gameData).select().single();
}

/**
 * ゲーム結果を一括挿入する
 */
export async function createGameResults(results: Array<{
    game_id: string;
    player_id: string | null;
    guest_player_id: string | null;
    seat: string;
    final_points: number;
    raw_score: number;
    uma: number;
    rank: number;
    total_score: number;
    point_amount: number;
  }>) {
  const supabase = await createClient();
  return await supabase.from("game_results").insert(results);
}

/**
 * ゲームを削除する
 */
export async function deleteGame(gameId: string) {
  const supabase = await createClient();
  return await supabase.from("games").delete().eq("id", gameId);
}
