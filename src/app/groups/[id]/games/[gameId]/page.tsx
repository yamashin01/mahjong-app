import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireGroupMembership } from "@/lib/auth/group-access";
import * as groupsRepo from "@/lib/supabase/repositories";
import { createClient } from "@/lib/supabase/server";
import { getPlayerDisplayName } from "@/lib/utils/player";
import { EditAllGameResults } from "./components/edit-all-game-results";
import { EditGameInfo } from "./components/edit-game-info";
import { GameResultsTable } from "./components/game-results-table";

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
  const [_membership, gameResult, resultsData, groupResult, groupRulesResult] = await Promise.all([
    requireGroupMembership(groupId, user.id),
    groupsRepo.getGameById(gameId),
    groupsRepo.getGameResults(gameId),
    groupsRepo.getGroupName(groupId),
    groupsRepo.getGroupRules(groupId),
  ]);

  const { data: game } = gameResult;
  const { data: results } = resultsData;
  const { data: group } = groupResult;
  const { data: groupRules } = groupRulesResult;

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

  // イベントルールを考慮した開始点を取得
  let startPoints = groupRules?.start_points ?? 25000;
  if (game.event_id) {
    const { data: event } = await groupsRepo.getEventById(game.event_id);
    if (event?.start_points !== null && event?.start_points !== undefined) {
      startPoints = event.start_points;
    }
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">対局情報</h2>
            <EditGameInfo
              gameId={gameId}
              groupId={groupId}
              gameType={game.game_type as "tonpuu" | "tonnan"}
              playedAt={game.played_at}
              yakumanCount={game.yakuman_count ?? 0}
            />
          </div>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">対局結果</h2>
            <EditAllGameResults
              gameId={gameId}
              groupId={groupId}
              startPoints={startPoints}
              results={
                results?.map((result) => ({
                  id: result.id,
                  playerName: getPlayerDisplayName(result),
                  seat: seatNames[result.seat as keyof typeof seatNames],
                  finalPoints: result.final_points,
                })) ?? []
              }
            />
          </div>
          <GameResultsTable results={results || []} seatNames={seatNames} />
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
