import type { RankingData } from "@/types";

export function RankingSection({ rankings }: { rankings: RankingData[] }) {
  if (!rankings || rankings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>今日はまだ対局がありません</p>
        <p className="text-sm mt-2">対局を記録すると今日のランキングが表示されます</p>
      </div>
    );
  }

  // ポイント順でソート
  const sortedRankings = [...rankings].sort(
    (a, b) => Number(b.total_points || 0) - Number(a.total_points || 0),
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">順位</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">プレイヤー</th>
            <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">対局数</th>
            <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">1位</th>
            <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">1位率</th>
            <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">平均順位</th>
            <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">トータルpt</th>
          </tr>
        </thead>
        <tbody>
          {sortedRankings.map((player, index) => (
            <tr key={player.player_id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center justify-center w-8 h-8">
                  {index === 0 ? (
                    <span className="text-2xl">🥇</span>
                  ) : index === 1 ? (
                    <span className="text-2xl">🥈</span>
                  ) : index === 2 ? (
                    <span className="text-2xl">🥉</span>
                  ) : (
                    <span className="font-medium text-gray-600">{index + 1}</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{player.display_name || "名前未設定"}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-center font-mono">{player.games_played || 0}</td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center justify-center w-12 h-8 rounded-full bg-yellow-100 text-yellow-800 font-bold text-sm">
                  {player.first_place_count || 0}
                </span>
              </td>
              <td className="py-3 px-4 text-center font-mono text-sm">
                {(((player.first_place_count || 0) / (player.games_played || 1)) * 100).toFixed(1)}%
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-flex items-center justify-center w-12 h-8 rounded-full font-bold text-sm ${
                    (player.average_rank || 0) <= 2.0
                      ? "bg-green-100 text-green-800"
                      : (player.average_rank || 0) <= 2.5
                        ? "bg-blue-100 text-blue-800"
                        : (player.average_rank || 0) <= 3.0
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {Number(player.average_rank || 0).toFixed(2)}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <span
                  className={`font-mono font-bold ${
                    Number(player.total_points || 0) >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {Number(player.total_points || 0) >= 0 ? "+" : ""}
                  {Number(player.total_points || 0).toLocaleString()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 順位分布の凡例 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">平均順位の評価</p>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-green-800" />
            <span className="text-sm text-gray-600">優秀 (≤2.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-800" />
            <span className="text-sm text-gray-600">良好 (2.0-2.5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-100 border-2 border-orange-800" />
            <span className="text-sm text-gray-600">普通 (2.5-3.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-100 border-2 border-red-800" />
            <span className="text-sm text-gray-600">要改善 (&gt;3.0)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
