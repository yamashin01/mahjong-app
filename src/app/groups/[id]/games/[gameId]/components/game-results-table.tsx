import { getPlayerDisplayName } from "@/lib/utils/player";

interface GameResult {
  id: string;
  rank: number;
  seat: string;
  final_points: number;
  raw_score: number;
  uma: number;
  total_score: number;
  point_amount: number;
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
  guest_players?: { name: string } | null;
}

interface GameResultsTableProps {
  results: GameResult[];
  seatNames: Record<string, string>;
}

export function GameResultsTable({ results, seatNames }: GameResultsTableProps) {
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
    <>
      {/* デスクトップ表示 */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">順位</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">プレイヤー</th>
              <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">最終点</th>
              <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">素点</th>
              <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">ウマ</th>
              <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">スコア</th>
              <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">ポイント</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id} className="border-b border-gray-100">
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
                <td className={`py-3 px-4 text-right font-mono ${getScoreColor(result.raw_score)}`}>
                  {result.raw_score >= 0 ? "+" : ""}
                  {result.raw_score.toLocaleString()}
                </td>
                <td className={`py-3 px-4 text-right font-mono ${getScoreColor(result.uma)}`}>
                  {result.uma >= 0 ? "+" : ""}
                  {result.uma}
                </td>
                <td
                  className={`py-3 px-4 text-right font-mono font-bold ${getScoreColor(result.total_score)}`}
                >
                  {result.total_score >= 0 ? "+" : ""}
                  {Number(result.total_score).toFixed(1)}
                </td>
                <td
                  className={`py-3 px-4 text-right font-mono font-bold ${getScoreColor(result.point_amount)}`}
                >
                  {result.point_amount >= 0 ? "+" : ""}¥
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
          <div key={result.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
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

            {/* スコア詳細 */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
              <div>
                <div className="text-xs text-gray-600 mb-1">最終点</div>
                <div className="font-mono font-medium">{result.final_points.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">素点</div>
                <div className={`font-mono font-medium ${getScoreColor(result.raw_score)}`}>
                  {result.raw_score >= 0 ? "+" : ""}
                  {result.raw_score.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">ウマ</div>
                <div className={`font-mono font-medium ${getScoreColor(result.uma)}`}>
                  {result.uma >= 0 ? "+" : ""}
                  {result.uma}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">スコア</div>
                <div className={`font-mono font-bold ${getScoreColor(result.total_score)}`}>
                  {result.total_score >= 0 ? "+" : ""}
                  {Number(result.total_score).toFixed(1)}
                </div>
              </div>
            </div>

            {/* ポイント（強調表示） */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ポイント</span>
                <span
                  className={`font-mono font-bold text-lg ${getScoreColor(result.point_amount)}`}
                >
                  {result.point_amount >= 0 ? "+" : ""}¥
                  {Number(result.point_amount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
