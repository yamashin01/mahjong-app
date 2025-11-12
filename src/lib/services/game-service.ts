import * as eventsRepo from "@/lib/supabase/repositories/events";
import * as gamesRepo from "@/lib/supabase/repositories/games";
import * as groupsRepo from "@/lib/supabase/repositories/groups";
import { calculatePlayerRanks, calculateUmaAndOka } from "@/lib/utils/game-calculations";
import type { CreateGameInput } from "@/lib/validation/game-schemas";

/**
 * Game service layer
 * Business logic for game operations
 */

interface GameRules {
  game_type: "tonpuu" | "tonnan";
  start_points: number;
  return_points: number;
  uma_first: number;
  uma_second: number;
  uma_third: number;
  uma_fourth: number;
  oka_enabled: boolean;
  rate: number;
  tobi_prize: number;
  yakuman_prize: number;
  yakitori_prize: number;
  top_prize: number;
}

/**
 * Get rules for a game (either group rules or event-specific rules)
 */
export async function getRulesForGame(
  groupId: string,
  eventId: string | null | undefined,
): Promise<GameRules | null> {
  // グループルールを取得
  const { data: groupRules } = await groupsRepo.getGroupRules(groupId);

  if (!groupRules) {
    return null;
  }

  // イベントIDがない場合はグループルールをそのまま返す
  if (!eventId) {
    return groupRules as GameRules;
  }

  // イベントルールを取得
  const { data: event } = await eventsRepo.getEventById(eventId);

  if (!event) {
    return groupRules as GameRules;
  }

  // イベントにカスタムルールが設定されている場合は上書き
  return {
    ...(groupRules as GameRules),
    ...(event.game_type !== null && { game_type: event.game_type as "tonpuu" | "tonnan" }),
    ...(event.start_points !== null && { start_points: event.start_points }),
    ...(event.return_points !== null && {
      return_points: event.return_points,
    }),
    ...(event.uma_first !== null && { uma_first: event.uma_first }),
    ...(event.uma_second !== null && { uma_second: event.uma_second }),
    ...(event.uma_third !== null && { uma_third: event.uma_third }),
    ...(event.uma_fourth !== null && { uma_fourth: event.uma_fourth }),
    ...(event.oka_enabled !== null && { oka_enabled: event.oka_enabled }),
    ...(event.rate !== null && { rate: event.rate }),
    ...(event.tobi_prize !== null && { tobi_prize: event.tobi_prize }),
    ...(event.yakuman_prize !== null && {
      yakuman_prize: event.yakuman_prize,
    }),
    ...(event.yakitori_prize !== null && {
      yakitori_prize: event.yakitori_prize,
    }),
    ...(event.top_prize !== null && { top_prize: event.top_prize }),
  };
}

/**
 * Get the next game number
 */
export async function getNextGameNumber(
  groupId: string,
  eventId: string | null | undefined,
): Promise<number> {
  const { data: latestGame } = await gamesRepo.getLatestGameNumber(groupId, eventId);
  return latestGame ? latestGame.game_number + 1 : 1;
}

/**
 * Calculate game results for all players
 */
export function calculateGameResults(
  players: Array<{ playerId: string; finalPoints: number }>,
  rules: GameRules,
) {
  // 順位を計算
  const { rankGroups, playerRanks } = calculatePlayerRanks(players);

  // 座席を自動割り当て
  const seats = ["east", "south", "west", "north"] as const;

  // 素点の基準点（常に返し点を基準とする）
  const basePoints = rules.return_points;

  // 各順位グループのウマとオカを事前計算
  const groupUmaOka = calculateUmaAndOka(rankGroups, rules);

  // 各プレイヤーのスコアを計算
  return players.map((player, index) => {
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
      oka,
      rank,
      total_score: totalScore,
      point_amount: pointAmount,
    };
  });
}

/**
 * Create a game with results
 */
export async function createGameWithResults(input: CreateGameInput, userId: string) {
  // ルールを取得
  const rules = await getRulesForGame(input.groupId, input.eventId);

  if (!rules) {
    throw new Error("グループルールが見つかりません");
  }

  // 対局番号を取得
  const gameNumber = await getNextGameNumber(input.groupId, input.eventId);

  // 結果を計算
  const results = calculateGameResults(input.players, rules);

  // 対局記録を作成
  const { data: game, error: gameError } = await gamesRepo.createGame({
    group_id: input.groupId,
    game_type: input.gameType,
    game_number: gameNumber,
    played_at: new Date().toISOString(),
    recorded_by: userId,
    event_id: input.eventId || null,
    tobi_player_id: null,
    tobi_guest_player_id: null,
    yakuman_count: 0,
  });

  if (gameError || !game) {
    throw gameError || new Error("対局の作成に失敗しました");
  }

  // 各プレイヤーの結果を保存
  const gameResults = results.map((result) => ({
    game_id: game.id,
    ...result,
  }));

  const { error: resultsError } = await gamesRepo.createGameResults(gameResults);

  if (resultsError) {
    // ゲームを削除してロールバック
    await gamesRepo.deleteGame(game.id);
    throw resultsError;
  }

  return game;
}

/**
 * Update game information (tobi, yakuman)
 */
export async function updateGameInformation(
  gameId: string,
  updates: {
    tobiPlayerId?: string | null;
    tobiGuestPlayerId?: string | null;
    yakumanCount?: number;
  },
) {
  const { data: game, error } = await gamesRepo.updateGame(gameId, {
    tobi_player_id: updates.tobiPlayerId,
    tobi_guest_player_id: updates.tobiGuestPlayerId,
    yakuman_count: updates.yakumanCount,
  });

  if (error || !game) {
    throw error || new Error("対局情報の更新に失敗しました");
  }

  return game;
}
