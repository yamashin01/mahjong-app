"use client";

import { getPlayerDisplayName } from "@/lib/utils/player";

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

interface PlayerDetailModalProps {
  result: GameResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerDetailModal({ result, isOpen, onClose }: PlayerDetailModalProps) {
  if (!isOpen || !result) return null;

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

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl ${getRankColor(result.rank)}`}
            >
              {result.rank}
            </span>
            <div>
              <h2 className="text-xl font-bold">{getPlayerDisplayName(result)}</h2>
              <p className="text-sm text-gray-600">{result.seat}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 詳細情報 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">最終点</span>
            <span className="font-mono font-medium text-lg">
              {result.final_points.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">素点</span>
            <span className={`font-mono font-medium text-lg ${getScoreColor(result.raw_score)}`}>
              {result.raw_score >= 0 ? "+" : ""}
              {result.raw_score.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">ウマ</span>
            <span className={`font-mono font-medium text-lg ${getScoreColor(result.uma)}`}>
              {result.uma >= 0 ? "+" : ""}
              {result.uma}
            </span>
          </div>

          {result.oka !== 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">オカ</span>
              <span className={`font-mono font-medium text-lg ${getScoreColor(result.oka)}`}>
                {result.oka >= 0 ? "+" : ""}
                {result.oka}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">スコア</span>
            <span className={`font-mono font-bold text-lg ${getScoreColor(result.total_score)}`}>
              {result.total_score >= 0 ? "+" : ""}
              {Number(result.total_score)}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3 mt-3">
            <span className="text-sm font-medium text-gray-700">ポイント</span>
            <span className={`font-mono font-bold text-2xl ${getScoreColor(result.point_amount)}`}>
              {result.point_amount >= 0 ? "+" : ""}
              {Number(result.point_amount).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 閉じるボタン */}
        <div className="pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
