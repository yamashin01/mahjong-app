/**
 * 麻雀ゲームのスコア計算ユーティリティ
 */

type Player = {
  playerId: string;
  finalPoints: number;
};

type RankGroup = {
  rank: number;
  players: Player[];
  points: number;
};

/**
 * プレイヤーの順位を計算（同点処理を含む）
 * @param players プレイヤーと点数の配列
 * @returns 順位グループの配列とプレイヤー順位マップ
 */
export function calculatePlayerRanks(players: Player[]): {
  rankGroups: RankGroup[];
  playerRanks: Map<string, number>;
} {
  const sortedPlayers = [...players].sort((a, b) => b.finalPoints - a.finalPoints);
  const playerRanks = new Map<string, number>();
  const rankGroups: RankGroup[] = [];

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

  return { rankGroups, playerRanks };
}

type GameRules = {
  uma_first: number;
  uma_second: number;
  uma_third: number;
  uma_fourth: number;
  oka_enabled: boolean;
  return_points: number;
  start_points: number;
};

/**
 * 各順位グループのウマとオカを計算
 * @param rankGroups 順位グループの配列
 * @param rules ゲームルール
 * @returns 順位ごとのウマとオカのマップ
 */
export function calculateUmaAndOka(
  rankGroups: RankGroup[],
  rules: GameRules,
): Map<number, { uma: number; oka: number }> {
  const umaValues = [rules.uma_first, rules.uma_second, rules.uma_third, rules.uma_fourth];
  const okaTotal = rules.oka_enabled ? (rules.return_points - rules.start_points) * 4 : 0;
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

  return groupUmaOka;
}
