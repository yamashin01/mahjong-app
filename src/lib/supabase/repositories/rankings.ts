import { createClient } from "@/lib/supabase/server";

/**
 * イベントのランキングを取得する
 * 全対局の合計ポイントで順位付け
 */
export async function getEventRankings(eventId: string) {
  const supabase = await createClient();

  // イベントに紐づく全対局のgame_resultsを集計
  const { data, error } = await supabase
    .from("game_results")
    .select(`
      player_id,
      guest_player_id,
      point_amount,
      rank,
      profiles!game_results_player_id_fkey(display_name),
      guest_players!game_results_guest_player_id_fkey(name),
      games!inner(event_id)
    `)
    .eq("games.event_id", eventId);

  if (error) {
    return { data: null, error };
  }

  // プレイヤーごとに集計
  const playerStats = new Map<
    string,
    {
      playerId: string | null;
      guestPlayerId: string | null;
      displayName: string;
      totalPoints: number;
      gamesPlayed: number;
      firstPlaceCount: number;
      secondPlaceCount: number;
      thirdPlaceCount: number;
      fourthPlaceCount: number;
    }
  >();

  for (const result of data || []) {
    // プレイヤーIDまたはゲストプレイヤーIDを使用
    const playerId = result.player_id || result.guest_player_id;
    if (!playerId) continue;

    const displayName = result.profiles?.display_name || result.guest_players?.name || "不明";

    if (!playerStats.has(playerId)) {
      playerStats.set(playerId, {
        playerId: result.player_id,
        guestPlayerId: result.guest_player_id,
        displayName,
        totalPoints: 0,
        gamesPlayed: 0,
        firstPlaceCount: 0,
        secondPlaceCount: 0,
        thirdPlaceCount: 0,
        fourthPlaceCount: 0,
      });
    }

    const stats = playerStats.get(playerId)!;
    stats.totalPoints += result.point_amount;
    stats.gamesPlayed += 1;

    if (result.rank === 1) stats.firstPlaceCount += 1;
    else if (result.rank === 2) stats.secondPlaceCount += 1;
    else if (result.rank === 3) stats.thirdPlaceCount += 1;
    else if (result.rank === 4) stats.fourthPlaceCount += 1;
  }

  // 合計ポイント順にソートして順位を割り当て（同点は同順位）
  const sortedStats = Array.from(playerStats.values()).sort(
    (a, b) => b.totalPoints - a.totalPoints,
  );

  const rankings = [];
  let currentRank = 1;
  let i = 0;

  while (i < sortedStats.length) {
    const currentPoints = sortedStats[i].totalPoints;
    const group = [sortedStats[i]];

    // 同点のプレイヤーを探す
    let j = i + 1;
    while (j < sortedStats.length && sortedStats[j].totalPoints === currentPoints) {
      group.push(sortedStats[j]);
      j++;
    }

    // このグループの全員に同じ順位を割り当て
    for (const stats of group) {
      rankings.push({
        rank: currentRank,
        ...stats,
      });
    }

    // 次の順位は同点人数分スキップ
    currentRank += group.length;
    i = j;
  }

  return { data: rankings, error: null };
}
