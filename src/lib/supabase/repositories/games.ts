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

/**
 * ゲーム詳細を取得する
 */
export async function getGameById(gameId: string) {
  const supabase = await createClient();
  return await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();
}

/**
 * ゲーム結果を取得する
 */
export async function getGameResults(gameId: string) {
  const supabase = await createClient();
  return await supabase
    .from("game_results")
    .select(
      `
      *,
      profiles (
        display_name,
        avatar_url
      ),
      guest_players (
        name
      )
    `,
    )
    .eq("game_id", gameId)
    .order("rank", { ascending: true });
}

/**
 * グループの最近のゲーム一覧を取得する
 */
export async function getRecentGames(params: { groupId: string; limit?: number }) {
  const supabase = await createClient();
  return await supabase
    .from("games")
    .select("*, game_results(rank, profiles(display_name), guest_players(name))")
    .eq("group_id", params.groupId)
    .order("played_at", { ascending: false })
    .limit(params.limit || 5);
}

/**
 * イベントに紐づくゲーム一覧を取得する
 */
export async function getEventGames(eventId: string) {
  const supabase = await createClient();
  return await supabase
    .from("games")
    .select("*, game_results(rank, profiles(display_name), guest_players(name))")
    .eq("event_id", eventId)
    .order("played_at", { ascending: false });
}
