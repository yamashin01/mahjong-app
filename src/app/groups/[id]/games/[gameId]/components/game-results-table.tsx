"use client";

import { useState } from "react";
import { getPlayerDisplayName } from "@/lib/utils/player";
import { PlayerDetailModal } from "./player-detail-modal";

interface GameResult {
  id: string;
  rank: number;
  seat: string;
  final_points: number;
  raw_score: number;
  uma: number;
  oka: number;
  total_score: number;
  point_amount: number;
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
  guest_players?: { name: string } | null;
}

interface GameResultsTableProps {
  results: GameResult[];
}

export function GameResultsTable({ results }: GameResultsTableProps) {
  const [selectedResult, setSelectedResult] = useState<GameResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800";
      case 2:
        return "bg-gray-100 text-gray-800";
      case 3:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getScoreColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  const handleRowClick = (result: GameResult) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResult(null);
  };

  return (
    <>
      {/* デスクトップ表示 */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">順位</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">プレイヤー</th>
              <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">最終点</th>
              <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">ポイント</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr
                key={result.id}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(result)}
              >
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${getRankColor(result.rank)}`}
                  >
                    {result.rank}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium">{getPlayerDisplayName(result)}</td>
                <td className="py-3 px-4 text-right font-mono">
                  {result.final_points.toLocaleString()}
                </td>
                <td
                  className={`py-3 px-4 text-right font-mono font-bold ${getScoreColor(result.point_amount)}`}
                >
                  {result.point_amount >= 0 ? "+" : ""}
                  {Number(result.point_amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* モバイル表示 */}
      <div className="md:hidden space-y-4">
        {results.map((result) => (
          <div
            key={result.id}
            className="bg-gray-50 rounded-lg p-4 space-y-3 hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => handleRowClick(result)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleRowClick(result);
              }
            }}
            role="button"
            tabIndex={0}
          >
            {/* ヘッダー: 順位とプレイヤー名 */}
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${getRankColor(result.rank)}`}
              >
                {result.rank}
              </span>
              <div className="flex-1">
                <div className="font-medium text-lg">{getPlayerDisplayName(result)}</div>
              </div>
            </div>

            {/* 簡略スコア表示 */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
              <div>
                <div className="text-xs text-gray-600 mb-1">最終点</div>
                <div className="font-mono font-medium">{result.final_points.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">ポイント</div>
                <div className={`font-mono font-bold text-lg ${getScoreColor(result.point_amount)}`}>
                  {result.point_amount >= 0 ? "+" : ""}
                  {Number(result.point_amount).toLocaleString()}
                </div>
              </div>
            </div>

            {/* タップして詳細を表示するヒント */}
            <div className="pt-2 text-center">
              <span className="text-xs text-gray-500">タップして詳細を表示</span>
            </div>
          </div>
        ))}
      </div>

      {/* プレイヤー詳細モーダル */}
      <PlayerDetailModal result={selectedResult} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
