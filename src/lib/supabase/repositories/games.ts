import { createClient } from "@/lib/supabase/server";
import type { GameInsert, GameResultInsert } from "@/types";

/**
 * グループの最新ゲーム番号を取得する
 */
export async function getLatestGameNumber(groupId: string, eventId?: string | null) {
  const supabase = await createClient();
  let query = supabase
    .from("games")
    .select("game_number")
    .eq("group_id", groupId);

  // イベントIDが指定されている場合は、そのイベント内での最新番号を取得
  if (eventId) {
    query = query.eq("event_id", eventId);
  }

  return await query.order("game_number", { ascending: false }).limit(1).single();
}

/**
 * ゲームを作成する
 */
export async function createGame(gameData: GameInsert) {
  const supabase = await createClient();
  return await supabase.from("games").insert(gameData).select().single();
}

/**
 * ゲーム結果を一括挿入する
 */
export async function createGameResults(results: GameResultInsert[]) {
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
 * ゲーム情報を更新する
 */
export async function updateGame(gameId: string, gameData: Partial<GameInsert>) {
  const supabase = await createClient();
  return await supabase.from("games").update(gameData).eq("id", gameId).select().single();
}

/**
 * ゲーム結果を更新する
 */
export async function updateGameResult(resultId: string, resultData: Partial<GameResultInsert>) {
  const supabase = await createClient();
  return await supabase
    .from("game_results")
    .update(resultData)
    .eq("id", resultId)
    .select()
    .single();
}

/**
 * ゲーム詳細を取得する
 */
export async function getGameById(gameId: string) {
  const supabase = await createClient();
  return await supabase.from("games").select("*").eq("id", gameId).single();
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
