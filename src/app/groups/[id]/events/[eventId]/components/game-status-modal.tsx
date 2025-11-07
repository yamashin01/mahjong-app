"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getPlayerDisplayName } from "@/lib/utils/player";

interface GameResult {
  rank: number;
  point_amount: number;
  player_id: string | null;
  guest_player_id: string | null;
  profiles?: { display_name?: string | null } | null;
  guest_players?: { name?: string } | null;
}

interface GameWithResults {
  id: string;
  game_results?: GameResult[] | null;
}

interface GameStatusModalProps {
  games: GameWithResults[];
}

export function GameStatusModal({ games }: GameStatusModalProps) {
  const [open, setOpen] = useState(false);

  // Calculate current standings from all games
  const playerStats = new Map<
    string,
    {
      displayName: string;
      totalPoints: number;
      gamesPlayed: number;
      firstPlaceCount: number;
      secondPlaceCount: number;
      thirdPlaceCount: number;
      fourthPlaceCount: number;
    }
  >();

  // Aggregate stats from all games
  for (const game of games) {
    if (!game.game_results) continue;

    for (const result of game.game_results) {
      const playerId = result.player_id || result.guest_player_id || "";
      const displayName = getPlayerDisplayName(result);

      if (!playerStats.has(playerId)) {
        playerStats.set(playerId, {
          displayName,
          totalPoints: 0,
          gamesPlayed: 0,
          firstPlaceCount: 0,
          secondPlaceCount: 0,
          thirdPlaceCount: 0,
          fourthPlaceCount: 0,
        });
      }

      const stats = playerStats.get(playerId);
      if (stats) {
        stats.totalPoints += result.point_amount || 0;
        stats.gamesPlayed += 1;
        if (result.rank === 1) stats.firstPlaceCount += 1;
        if (result.rank === 2) stats.secondPlaceCount += 1;
        if (result.rank === 3) stats.thirdPlaceCount += 1;
        if (result.rank === 4) stats.fourthPlaceCount += 1;
      }
    }
  }

  // Convert to array and sort by total points
  const standings = Array.from(playerStats.values()).sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full rounded-lg border-2 border-stone-300 bg-stone-50 px-4 py-2 text-sm text-stone-600 font-semibold hover:bg-stone-100 transition-colors"
        >
          対局状況
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>現在の対局状況</DialogTitle>
        </DialogHeader>

        {standings.length > 0 ? (
          <div className="space-y-4">
            {/* モバイル: カード形式 */}
            <div className="md:hidden space-y-3">
              {standings.map((player, index) => (
                <div
                  key={`${player.displayName}-${index}`}
                  className="rounded-lg border border-gray-200 p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-700">{index + 1}位</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">{player.displayName}</div>
                  </div>

                  <div className="mb-3 text-center py-2 bg-white rounded-md">
                    <div className="text-xs text-gray-500 mb-1">合計ポイント</div>
                    <div
                      className={`text-2xl font-bold ${
                        player.totalPoints >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {player.totalPoints >= 0 ? "+" : ""}
                      {player.totalPoints.toFixed(1)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white rounded-md p-2 text-center">
                      <div className="text-xs text-gray-500">対局数</div>
                      <div className="font-semibold text-gray-900">{player.gamesPlayed}</div>
                    </div>
                    <div className="bg-white rounded-md p-2 text-center">
                      <div className="text-xs text-gray-500">順位分布</div>
                      <div className="font-semibold text-gray-900 text-xs">
                        {player.firstPlaceCount}-{player.secondPlaceCount}-{player.thirdPlaceCount}-
                        {player.fourthPlaceCount}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* デスクトップ: テーブル形式 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      順位
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      プレイヤー
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      合計ポイント
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      対局数
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      1-2-3-4位
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {standings.map((player, index) => (
                    <tr key={`${player.displayName}-${index}`} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{index + 1}位</span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {player.displayName}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right">
                        <div
                          className={`text-sm font-semibold ${
                            player.totalPoints >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {player.totalPoints >= 0 ? "+" : ""}
                          {player.totalPoints.toFixed(1)}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900">{player.gamesPlayed}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">
                          {player.firstPlaceCount}-{player.secondPlaceCount}-
                          {player.thirdPlaceCount}-{player.fourthPlaceCount}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-sm text-gray-600 text-center mt-4">
              全{games.length}対局の集計結果
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>まだ対局記録がありません</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
