"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GameResult {
  gameNumber: number;
  gameDate: string;
  gameType: string;
  rank: number;
  finalPoints: number;
  rawScore: number;
  pointAmount: number;
  uma: number;
  oka: number;
}

interface PlayerGamesModalProps {
  playerName: string;
  playerId: string | null;
  guestPlayerId: string | null;
  eventId: string;
  children: React.ReactNode;
}

export function PlayerGamesModal({
  playerName,
  playerId,
  guestPlayerId,
  eventId,
  children,
}: PlayerGamesModalProps) {
  const [open, setOpen] = useState(false);
  const [games, setGames] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlayerGames = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (playerId) params.append("playerId", playerId);
      if (guestPlayerId) params.append("guestPlayerId", guestPlayerId);

      const response = await fetch(`/api/events/${eventId}/player-games?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setGames(data.games || []);
      } else {
        console.error("API error:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch player games:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && games.length === 0) {
      fetchPlayerGames();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{playerName} の対局詳細</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <p>読み込み中...</p>
          </div>
        ) : games.length > 0 ? (
          <div className="space-y-4">
            {/* モバイル: カード形式 */}
            <div className="md:hidden space-y-3">
              {games.map((game) => (
                <div
                  key={`${game.gameNumber}-${game.gameDate}`}
                  className="rounded-lg border border-gray-200 p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">第{game.gameNumber}回戦</div>
                      <div className="text-sm text-gray-600">{game.gameDate}</div>
                      <div className="text-xs text-gray-500">
                        {game.gameType === "tonpuu" ? "東風戦" : "東南戦"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{game.rank}位</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* 上段: 得点と素点 */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white rounded-md p-2">
                        <div className="text-xs text-gray-500">得点</div>
                        <div className="font-semibold text-gray-900">
                          {game.finalPoints.toLocaleString()}点
                        </div>
                      </div>
                      <div className="bg-white rounded-md p-2">
                        <div className="text-xs text-gray-500">素点</div>
                        <div
                          className={`font-semibold ${
                            game.rawScore >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {game.rawScore >= 0 ? "+" : ""}
                          {game.rawScore.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* 中段: ウマとオカ */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white rounded-md p-2">
                        <div className="text-xs text-gray-500">ウマ</div>
                        <div
                          className={`font-semibold ${
                            game.uma >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {game.uma >= 0 ? "+" : ""}
                          {game.uma.toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-white rounded-md p-2">
                        <div className="text-xs text-gray-500">オカ</div>
                        <div
                          className={`font-semibold ${
                            game.oka >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {game.oka >= 0 ? "+" : ""}
                          {game.oka.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* 下段: 合計点とポイント */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white rounded-md p-2">
                        <div className="text-xs text-gray-500">合計点</div>
                        <div
                          className={`font-semibold ${
                            game.rawScore + game.uma + game.oka >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {game.rawScore + game.uma + game.oka >= 0 ? "+" : ""}
                          {(game.rawScore + game.uma + game.oka).toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-white rounded-md p-2">
                        <div className="text-xs text-gray-500">ポイント</div>
                        <div
                          className={`font-semibold ${
                            game.pointAmount >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {game.pointAmount >= 0 ? "+" : ""}
                          {game.pointAmount.toFixed(1)}
                        </div>
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
                      対局
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日時
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      順位
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      得点
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      素点
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ウマ
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      オカ
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      合計点
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ポイント
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {games.map((game) => (
                    <tr key={`${game.gameNumber}-${game.gameDate}`} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          第{game.gameNumber}回戦
                        </div>
                        <div className="text-xs text-gray-500">
                          {game.gameType === "tonpuu" ? "東風戦" : "東南戦"}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {game.gameDate}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-900">{game.rank}位</span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {game.finalPoints.toLocaleString()}点
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right">
                        <span
                          className={`text-sm font-semibold ${
                            game.rawScore >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {game.rawScore >= 0 ? "+" : ""}
                          {game.rawScore.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right">
                        <span
                          className={`text-sm font-semibold ${
                            game.uma >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {game.uma >= 0 ? "+" : ""}
                          {game.uma.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right">
                        <span
                          className={`text-sm font-semibold ${
                            game.oka >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {game.oka >= 0 ? "+" : ""}
                          {game.oka.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right">
                        <span
                          className={`text-sm font-semibold ${
                            game.rawScore + game.uma + game.oka >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {game.rawScore + game.uma + game.oka >= 0 ? "+" : ""}
                          {(game.rawScore + game.uma + game.oka).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right">
                        <span
                          className={`text-sm font-semibold ${
                            game.pointAmount >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {game.pointAmount >= 0 ? "+" : ""}
                          {game.pointAmount.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-sm text-gray-600 text-center mt-4">全{games.length}対局</div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>対局記録がありません</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
