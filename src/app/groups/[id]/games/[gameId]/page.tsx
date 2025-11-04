import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireGroupMembership } from "@/lib/auth/group-access";
import * as groupsRepo from "@/lib/supabase/repositories";
import { createClient } from "@/lib/supabase/server";
import { getPlayerDisplayName } from "@/lib/utils/player";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string; gameId: string }>;
}) {
  const { id: groupId, gameId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // メンバーシップ確認とデータを並列取得（パフォーマンス最適化）
  const [_membership, gameResult, resultsData, groupResult] = await Promise.all([
    requireGroupMembership(groupId, user.id),
    groupsRepo.getGameById(gameId),
    groupsRepo.getGameResults(gameId),
    groupsRepo.getGroupName(groupId),
  ]);

  const { data: game } = gameResult;
  const { data: results } = resultsData;
  const { data: group } = groupResult;

  if (!game) {
    notFound();
  }

  if (!group) {
    notFound();
  }

  // トビしたプレイヤー情報を取得
  let tobiPlayerName = null;
  if (game.tobi_player_id) {
    const { data } = await groupsRepo.getProfileDisplayName(game.tobi_player_id);
    tobiPlayerName = data?.display_name;
  } else if (game.tobi_guest_player_id) {
    const { data } = await groupsRepo.getGuestPlayerName(game.tobi_guest_player_id);
    tobiPlayerName = data?.name;
  }

  const seatNames = {
    east: "東",
    south: "南",
    west: "西",
    north: "北",
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">対局詳細</h1>
          <p className="text-gray-600">{group.name}</p>
        </div>

        {/* 対局情報 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">対局情報</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-600">対局種別</dt>
              <dd className="font-medium">{game.game_type === "tonpuu" ? "東風戦" : "東南戦"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">回戦数</dt>
              <dd className="font-medium">{game.game_number}回戦</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">対局日時</dt>
              <dd className="font-medium">
                {new Date(game.played_at).toLocaleString("ja-JP", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">役満回数</dt>
              <dd className="font-medium">{game.yakuman_count}回</dd>
            </div>
            {tobiPlayerName && (
              <div className="col-span-2">
                <dt className="text-sm text-gray-600">トビ</dt>
                <dd className="font-medium">{tobiPlayerName || "名前未設定"}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* 対局結果 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">対局結果</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">順位</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                    プレイヤー
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">座席</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">最終点</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">素点</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">ウマ</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">スコア</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-600">
                    ポイント
                  </th>
                </tr>
              </thead>
              <tbody>
                {results?.map((result) => (
                  <tr key={result.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          result.rank === 1
                            ? "bg-yellow-100 text-yellow-800"
                            : result.rank === 2
                              ? "bg-gray-100 text-gray-800"
                              : result.rank === 3
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {result.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{getPlayerDisplayName(result)}</td>
                    <td className="py-3 px-4">
                      {seatNames[result.seat as keyof typeof seatNames]}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {result.final_points.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono ${
                        result.raw_score >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {result.raw_score >= 0 ? "+" : ""}
                      {result.raw_score.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono ${
                        result.uma >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {result.uma >= 0 ? "+" : ""}
                      {result.uma}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        result.total_score >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {result.total_score >= 0 ? "+" : ""}
                      {Number(result.total_score).toFixed(1)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        result.point_amount >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {result.point_amount >= 0 ? "+" : ""}¥
                      {Number(result.point_amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center">
          {game.event_id ? (
            <Link
              href={`/groups/${groupId}/events/${game.event_id}`}
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              イベントページに戻る
            </Link>
          ) : (
            <Link
              href={`/groups/${groupId}`}
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              グループページに戻る
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
