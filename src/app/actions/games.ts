"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireGroupMembership } from "@/lib/auth/group-access";
import { createGameWithResults } from "@/lib/services/game-service";
import * as eventsRepo from "@/lib/supabase/repositories/events";
import * as gamesRepo from "@/lib/supabase/repositories/games";
import * as groupsRepo from "@/lib/supabase/repositories/groups";
import { createClient } from "@/lib/supabase/server";
import { parseFormData, parseGameFormData } from "@/lib/validation/form-data-parser";
import { CreateGameInputSchema } from "@/lib/validation/game-schemas";

export async function createGame(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // FormDataをパースしてバリデーション
  const parseResult = parseFormData(formData, CreateGameInputSchema, parseGameFormData);

  if (!parseResult.success) {
    return { error: parseResult.error };
  }

  const input = parseResult.data;

  // セキュリティ: グループメンバーシップチェック
  try {
    await requireGroupMembership(input.groupId, user.id);
  } catch {
    return { error: "このグループのメンバーのみが対局を記録できます" };
  }

  // ゲーム作成サービスを実行
  let game: { id: string };
  try {
    game = await createGameWithResults(input, user.id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "対局の作成に失敗しました",
    };
  }

  // revalidateとredirectはtry-catchの外で実行
  revalidatePath(`/groups/${input.groupId}`);
  if (input.eventId) {
    revalidatePath(`/groups/${input.groupId}/events/${input.eventId}`);
  }
  redirect(`/groups/${input.groupId}/games/${game.id}`);
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

  // 入力値検証: 役満回数は0〜20の範囲
  if (Number.isNaN(yakumanCount) || yakumanCount < 0 || yakumanCount > 20) {
    return { error: "役満回数は0〜20の範囲で入力してください" };
  }

  // セキュリティ: グループメンバーシップチェック
  try {
    await requireGroupMembership(groupId, user.id);
  } catch {
    return { error: "このグループのメンバーのみが対局情報を更新できます" };
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

  // 入力値検証: 最終点数は-100,000〜200,000の範囲
  if (finalPoints < -100000 || finalPoints > 200000) {
    return { error: "最終点数が範囲外です（-100,000〜200,000）" };
  }

  // セキュリティ: グループメンバーシップチェック
  try {
    await requireGroupMembership(groupId, user.id);
  } catch {
    return { error: "このグループのメンバーのみが対局結果を更新できます" };
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
