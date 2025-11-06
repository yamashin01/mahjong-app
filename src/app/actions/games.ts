"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as eventsRepo from "@/lib/supabase/repositories/events";
import * as gamesRepo from "@/lib/supabase/repositories/games";
import * as groupsRepo from "@/lib/supabase/repositories/groups";
import { createClient } from "@/lib/supabase/server";

export async function createGame(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const groupId = formData.get("groupId") as string;
  const gameType = formData.get("gameType") as "tonpuu" | "tonnan";
  const playedAt = formData.get("playedAt") as string;
  const eventId = formData.get("eventId") as string | null;

  // 回戦数を自動採番（グループ内の最新の対局記録+1）
  const { data: latestGame } = await gamesRepo.getLatestGameNumber(groupId);

  const gameNumber = latestGame ? latestGame.game_number + 1 : 1;

  // プレイヤーと点数のデータを取得
  const players = [];
  for (let i = 1; i <= 4; i++) {
    const playerId = formData.get(`player${i}Id`) as string;
    const finalPoints = Number.parseInt(formData.get(`player${i}FinalPoints`) as string, 10);

    if (!playerId || Number.isNaN(finalPoints)) {
      return { error: `プレイヤー${i}の情報が不足しています` };
    }

    players.push({ playerId, finalPoints });
  }

  // グループルールを取得
  const { data: groupRules } = await groupsRepo.getGroupRules(groupId);

  if (!groupRules) {
    return { error: "グループルールが見つかりません" };
  }

  // イベントIDが指定されている場合、イベントルールを取得
  let rules = groupRules;
  if (eventId) {
    const { data: event } = await eventsRepo.getEventById(eventId);

    if (event) {
      // イベントにカスタムルールが設定されている場合は上書き
      rules = {
        ...groupRules,
        ...(event.game_type !== null && { game_type: event.game_type }),
        ...(event.start_points !== null && { start_points: event.start_points }),
        ...(event.return_points !== null && { return_points: event.return_points }),
        ...(event.uma_first !== null && { uma_first: event.uma_first }),
        ...(event.uma_second !== null && { uma_second: event.uma_second }),
        ...(event.uma_third !== null && { uma_third: event.uma_third }),
        ...(event.uma_fourth !== null && { uma_fourth: event.uma_fourth }),
        ...(event.oka_enabled !== null && { oka_enabled: event.oka_enabled }),
        ...(event.rate !== null && { rate: event.rate }),
        ...(event.tobi_prize !== null && { tobi_prize: event.tobi_prize }),
        ...(event.yakuman_prize !== null && { yakuman_prize: event.yakuman_prize }),
        ...(event.top_prize !== null && { top_prize: event.top_prize }),
      };
    }
  }

  // 順位を計算（点数の降順、同点の場合は同順位）
  const sortedPlayers = [...players].sort((a, b) => b.finalPoints - a.finalPoints);

  // 同点処理を含む順位付け
  const playerRanks = new Map<string, number>();
  const rankGroups: { rank: number; players: typeof sortedPlayers; points: number }[] = [];

  let currentRank = 1;
  let i = 0;

  while (i < sortedPlayers.length) {
    const currentPoints = sortedPlayers[i].finalPoints;
    const group = [sortedPlayers[i]];

    // 同点のプレイヤーを探す
    let j = i + 1;
    while (j < sortedPlayers.length && sortedPlayers[j].finalPoints === currentPoints) {
      group.push(sortedPlayers[j]);
      j++;
    }

    // このグループの全員に同じ順位を割り当て
    for (const player of group) {
      playerRanks.set(player.playerId, currentRank);
    }

    rankGroups.push({
      rank: currentRank,
      players: group,
      points: currentPoints,
    });

    // 次の順位は同点人数分スキップ
    currentRank += group.length;
    i = j;
  }

  // 座席を自動割り当て
  const seats = ["east", "south", "west", "north"];

  // オカの計算
  // オカあり: 全員分の (返し点 - 開始点) の合計
  // オカなし: 0（開始点 = 返し点の場合も自動的に0になる）
  const okaTotal = rules.oka_enabled ? (rules.return_points - rules.start_points) * 4 : 0;

  // 素点の基準点
  // オカあり: 返し点を基準とする
  // オカなし: 開始点を基準とする（開始点 = 返し点なので結果は同じ）
  const basePoints = rules.oka_enabled ? rules.return_points : rules.start_points;

  // 各順位グループのウマとオカを事前計算
  const umaValues = [rules.uma_first, rules.uma_second, rules.uma_third, rules.uma_fourth];
  const groupUmaOka = new Map<number, { uma: number; oka: number }>();

  for (const group of rankGroups) {
    const groupSize = group.players.length;
    const startRankIndex = group.rank - 1; // 0-indexed

    // このグループが獲得するウマの合計を計算
    let totalUma = 0;
    for (let k = 0; k < groupSize && startRankIndex + k < 4; k++) {
      totalUma += umaValues[startRankIndex + k];
    }

    // ウマを均等分割（整数に丸める）
    const averageUma = Math.round(totalUma / groupSize);

    // オカは1位グループのみに配分（均等分割、整数に丸める）
    const averageOka = group.rank === 1 ? Math.round(okaTotal / groupSize) : 0;

    groupUmaOka.set(group.rank, { uma: averageUma, oka: averageOka });
  }

  // 各プレイヤーのスコアを計算
  const results = players.map((player, index) => {
    const rank = playerRanks.get(player.playerId) || 1;
    const rawScore = player.finalPoints - basePoints;

    // ゲストメンバーかどうかをチェック
    const isGuest = player.playerId.startsWith("guest-");
    const actualPlayerId = isGuest ? null : player.playerId;
    const guestPlayerId = isGuest ? player.playerId.replace("guest-", "") : null;

    // 同点グループのウマとオカを取得
    const { uma, oka } = groupUmaOka.get(rank) || { uma: 0, oka: 0 };

    // トータルスコア（素点 + ウマ + オカ）
    const totalScore = rawScore + uma + oka;

    // ポイント額（1.0なら1000点あたり100pt）
    const pointAmount = (totalScore / 10) * rules.rate;

    return {
      player_id: actualPlayerId,
      guest_player_id: guestPlayerId,
      seat: seats[index],
      final_points: player.finalPoints,
      raw_score: rawScore,
      uma,
      rank,
      total_score: totalScore,
      point_amount: pointAmount,
    };
  });

  // 対局記録を作成
  const { data: game, error: gameError } = await gamesRepo.createGame({
    group_id: groupId,
    game_type: gameType,
    game_number: gameNumber,
    played_at: playedAt,
    recorded_by: user.id,
    event_id: eventId || null,
    tobi_player_id: null,
    tobi_guest_player_id: null,
    yakuman_count: 0,
  });

  if (gameError) {
    console.error("Error creating game:", gameError);
    return { error: "対局の作成に失敗しました" };
  }

  // 各プレイヤーの結果を保存
  const gameResults = results.map((result) => ({
    game_id: game.id,
    ...result,
  }));

  const { error: resultsError } = await gamesRepo.createGameResults(gameResults);

  if (resultsError) {
    console.error("Error creating game results:", resultsError);
    // ゲームを削除してロールバック
    await gamesRepo.deleteGame(game.id);
    return { error: "対局結果の保存に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  if (eventId) {
    revalidatePath(`/groups/${groupId}/events/${eventId}`);
  }
  redirect(`/groups/${groupId}/games/${game.id}`);
}

export async function updateGameInfo(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const gameId = formData.get("gameId") as string;
  const groupId = formData.get("groupId") as string;
  const gameType = formData.get("gameType") as "tonpuu" | "tonnan";
  const playedAt = formData.get("playedAt") as string;
  const yakumanCount = Number.parseInt(formData.get("yakumanCount") as string, 10);

  if (!gameId || !groupId) {
    return { error: "必須パラメータが不足しています" };
  }

  // 対局情報を更新
  const { error: updateError } = await gamesRepo.updateGame(gameId, {
    game_type: gameType,
    played_at: playedAt,
    yakuman_count: yakumanCount,
  });

  if (updateError) {
    console.error("Error updating game:", updateError);
    return { error: "対局情報の更新に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}/games/${gameId}`);
  revalidatePath(`/groups/${groupId}`);

  const { data: game } = await gamesRepo.getGameById(gameId);
  if (game?.event_id) {
    revalidatePath(`/groups/${groupId}/events/${game.event_id}`);
  }

  return { success: true };
}

export async function updateGameResult(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resultId = formData.get("resultId") as string;
  const gameId = formData.get("gameId") as string;
  const groupId = formData.get("groupId") as string;
  const finalPoints = Number.parseInt(formData.get("finalPoints") as string, 10);

  if (!resultId || !gameId || !groupId || Number.isNaN(finalPoints)) {
    return { error: "必須パラメータが不足しています" };
  }

  // 現在の対局結果を全て取得
  const { data: allResults } = await gamesRepo.getGameResults(gameId);

  if (!allResults || allResults.length !== 4) {
    return { error: "対局結果の取得に失敗しました" };
  }

  // 更新対象の結果を見つける
  const targetResult = allResults.find((r) => r.id === resultId);
  if (!targetResult) {
    return { error: "対局結果が見つかりません" };
  }

  // 対局情報を取得してルールを取得
  const { data: game } = await gamesRepo.getGameById(gameId);
  if (!game) {
    return { error: "対局情報が見つかりません" };
  }

  // グループルールを取得
  const { data: groupRules } = await groupsRepo.getGroupRules(groupId);
  if (!groupRules) {
    return { error: "グループルールが見つかりません" };
  }

  // イベントIDが指定されている場合、イベントルールを取得
  let rules = groupRules;
  if (game.event_id) {
    const { data: event } = await eventsRepo.getEventById(game.event_id);
    if (event) {
      rules = {
        ...groupRules,
        ...(event.game_type !== null && { game_type: event.game_type }),
        ...(event.start_points !== null && { start_points: event.start_points }),
        ...(event.return_points !== null && { return_points: event.return_points }),
        ...(event.uma_first !== null && { uma_first: event.uma_first }),
        ...(event.uma_second !== null && { uma_second: event.uma_second }),
        ...(event.uma_third !== null && { uma_third: event.uma_third }),
        ...(event.uma_fourth !== null && { uma_fourth: event.uma_fourth }),
        ...(event.oka_enabled !== null && { oka_enabled: event.oka_enabled }),
        ...(event.rate !== null && { rate: event.rate }),
        ...(event.tobi_prize !== null && { tobi_prize: event.tobi_prize }),
        ...(event.yakuman_prize !== null && { yakuman_prize: event.yakuman_prize }),
        ...(event.top_prize !== null && { top_prize: event.top_prize }),
      };
    }
  }

  // 更新後の全プレイヤーの最終点を作成
  const updatedResults = allResults.map((r) => ({
    ...r,
    final_points: r.id === resultId ? finalPoints : r.final_points,
  }));

  // 順位を再計算（同点処理含む）
  const sortedResults = [...updatedResults].sort((a, b) => b.final_points - a.final_points);

  // 同点処理を含む順位付け
  const rankMap = new Map<string, number>();
  const rankGroups: { rank: number; results: typeof sortedResults; points: number }[] = [];

  let currentRank = 1;
  let i = 0;

  while (i < sortedResults.length) {
    const currentPoints = sortedResults[i].final_points;
    const group = [sortedResults[i]];

    // 同点のプレイヤーを探す
    let j = i + 1;
    while (j < sortedResults.length && sortedResults[j].final_points === currentPoints) {
      group.push(sortedResults[j]);
      j++;
    }

    // このグループの全員に同じ順位を割り当て
    for (const result of group) {
      rankMap.set(result.id, currentRank);
    }

    rankGroups.push({
      rank: currentRank,
      results: group,
      points: currentPoints,
    });

    // 次の順位は同点人数分スキップ
    currentRank += group.length;
    i = j;
  }

  // オカの計算（オカ有効な場合、全員の開始点と返し点の差分の合計）
  let okaTotal = 0;
  if (rules.oka_enabled) {
    okaTotal = (rules.return_points - rules.start_points) * 4;
  }

  // 素点の基準点（オカ有効時は返し点、無効時は開始点）
  const basePoints = rules.oka_enabled ? rules.return_points : rules.start_points;

  // 各順位グループのウマとオカを事前計算
  const umaValues = [rules.uma_first, rules.uma_second, rules.uma_third, rules.uma_fourth];
  const groupUmaOka = new Map<number, { uma: number; oka: number }>();

  for (const group of rankGroups) {
    const groupSize = group.results.length;
    const startRankIndex = group.rank - 1; // 0-indexed

    // このグループが獲得するウマの合計を計算
    let totalUma = 0;
    for (let k = 0; k < groupSize && startRankIndex + k < 4; k++) {
      totalUma += umaValues[startRankIndex + k];
    }

    // ウマを均等分割（整数に丸める）
    const averageUma = Math.round(totalUma / groupSize);

    // オカは1位グループのみに配分（均等分割、整数に丸める）
    const averageOka = group.rank === 1 ? Math.round(okaTotal / groupSize) : 0;

    groupUmaOka.set(group.rank, { uma: averageUma, oka: averageOka });
  }

  // 各プレイヤーのスコアを再計算して更新
  const updatePromises = updatedResults.map((result) => {
    const rank = rankMap.get(result.id) || 1;
    const rawScore = result.final_points - basePoints;

    // 同点グループのウマとオカを取得
    const { uma, oka } = groupUmaOka.get(rank) || { uma: 0, oka: 0 };

    // トータルスコア（素点 + ウマ + オカ）
    const totalScore = rawScore + uma + oka;

    // ポイント額（1.0なら1000点あたり100pt）
    const pointAmount = (totalScore / 10) * rules.rate;

    return gamesRepo.updateGameResult(result.id, {
      final_points: result.final_points,
      raw_score: rawScore,
      uma,
      rank,
      total_score: totalScore,
      point_amount: pointAmount,
    });
  });

  const results = await Promise.all(updatePromises);

  if (results.some((r) => r.error)) {
    console.error("Error updating game results:", results);
    return { error: "対局結果の更新に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}/games/${gameId}`);
  revalidatePath(`/groups/${groupId}`);
  if (game.event_id) {
    revalidatePath(`/groups/${groupId}/events/${game.event_id}`);
  }

  return { success: true };
}
