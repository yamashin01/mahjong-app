import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireGroupMembership } from "@/lib/auth/group-access";
import { createClient } from "@/lib/supabase/server";
import { getPlayerAvatarUrl, getPlayerDisplayName, hasPlayerAvatar } from "@/lib/utils/player";
import { CopyButton } from "./components/copy-button";
import { EventsSection } from "./components/events-section";
import { GuestPlayerActions } from "./components/guest-player-actions";
import { GuestPlayerForm } from "./components/guest-player-form";
import { MemberActions } from "./components/member-actions";
import { RankingSection } from "./components/ranking-section";
import { GoPerson } from "react-icons/go";
import * as groupsRepo from "@/lib/supabase/repositories";

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const groupId: string = (await params).id;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // グループ情報取得とメンバーシップ確認を並列実行（パフォーマンス最適化）
  const [groupResult, membership] = await Promise.all([
    groupsRepo.getGroupById(groupId),
    requireGroupMembership(groupId, user.id),
  ]);

  const { data: group, error: groupError } = groupResult;

  if (groupError || !group) {
    notFound();
  }

  // 残りの全データを並列取得（パフォーマンス最適化）
  const today = new Date().toISOString().split("T")[0];

  const [
    membersResult,
    { data: rules },
    gamesResult,
    { data: rankings },
    { data: guestPlayers },
    eventsResult,
  ] = await Promise.all([
    groupsRepo.getGroupMembers(groupId),
    groupsRepo.getGroupRules(groupId),
    groupsRepo.getRecentGames({ groupId, limit: 5 }),
    groupsRepo.getDailyRankings({ groupId, gameDate: today }),
    groupsRepo.getGroupGuestPlayers(groupId),
    groupsRepo.getGroupEvents(groupId),
  ]);

  const { data: events } = eventsResult;

  const { data: members, error: membersError } = membersResult;
  const { data: recentGames, error: gameError } = gamesResult;

  if (membersError) {
    console.error("Supabase Group Members Fetch Error:", membersError);
  }

  if (gameError) {
    console.error("Supabase Recent Games Fetch Error:", gameError);
  }

  const isAdmin = membership.role === "admin";

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
            {group.description && <p className="text-gray-600">{group.description}</p>}
          </div>
          {isAdmin && (
            <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800">
              管理者
            </span>
          )}
        </div>

        {/* 招待コード */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <h2 className="text-lg font-semibold mb-3">招待コード</h2>
          <div className="flex items-center gap-3">
            <code className="flex-1 rounded-lg bg-gray-100 px-4 py-3 text-2xl font-mono font-bold text-center">
              {group.invite_code}
            </code>
            <CopyButton code={group.invite_code} />
          </div>
          <p className="text-sm text-gray-600 mt-2">このコードを共有してメンバーを招待できます</p>
        </div>

        {/* メンバー一覧 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">メンバー ({members?.length || 0}人)</h2>
          </div>
          <div className="space-y-3 mb-4">
            {members?.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  {hasPlayerAvatar(member as any) ? (
                    <Image
                      src={getPlayerAvatarUrl(member as any)!}
                      alt={getPlayerDisplayName(member as any)}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                  )}
                  <div>
                    <p className="font-medium">{getPlayerDisplayName(member as any)}</p>
                    <p className="text-sm text-gray-500">
                      参加日: {new Date(member.joined_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    {member.role === "admin" && (
                      <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                        管理者
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <MemberActions
                      groupId={groupId}
                      userId={member.user_id}
                      currentRole={member.role as "admin" | "member"}
                      isCurrentUser={member.user_id === user.id}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ゲストメンバー */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              ゲストメンバー ({guestPlayers?.length || 0}人)
            </h2>
          </div>
          <div className="space-y-3">
            {guestPlayers && guestPlayers.length > 0 ? (
              guestPlayers.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-full flex items-center justify-center">
                      <GoPerson />
                    </div>
                    <div>
                      <p className="font-medium">{guest.name}</p>
                      <p className="text-sm text-gray-500">
                        追加日: {new Date(guest.created_at!).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <GuestPlayerActions
                      groupId={groupId}
                      guestPlayerId={guest.id}
                      guestPlayerName={guest.name}
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>ゲストメンバーーはいません</p>
                {isAdmin && (
                  <p className="text-sm mt-2">「ゲストメンバー追加」ボタンから追加できます</p>
                )}
              </div>
            )}
            {isAdmin && <GuestPlayerForm groupId={groupId} />}
          </div>
        </div>

        {/* イベント */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <EventsSection groupId={groupId} events={events || []} isAdmin={isAdmin} />
        </div>

        {/* 対局記録 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">対局記録</h2>
          </div>
          <div className="w-full my-4">
            <Link
              href={`/groups/${groupId}/games/new`}
              className="block w-full rounded-lg bg-gray-100 px-4 py-2 text-sm text-center text-gray-800 hover:bg-gray-200 transition-colors"
            >
              新規対局を記録
            </Link>
          </div>

          {recentGames && recentGames.length > 0 ? (
            <div className="space-y-3">
              {recentGames.map((game) => {
                // 1位のプレイヤーを取得
                const winner = game.game_results?.find((r) => r.rank === 1);
                return (
                  <Link
                    key={game.id}
                    href={`/groups/${groupId}/games/${game.id}`}
                    className="block rounded-lg bg-gray-50 p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {game.game_type === "tonpuu" ? "東風戦" : "東南戦"} 第{game.game_number}
                          回戦
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(game.played_at).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">1位</p>
                        <p className="font-medium">{getPlayerDisplayName(winner)}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>まだ対局記録がありません</p>
              <p className="text-sm mt-2">「新規対局を記録」ボタンから対局を記録してください</p>
            </div>
          )}
        </div>

        {/* 今日のランキング */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">今日のランキング</h2>
          <RankingSection rankings={rankings || []} />
        </div>

        {/* グループルール */}
        {rules && (
          <div className="rounded-lg border border-gray-200 p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">グループルール</h2>
              {isAdmin && (
                <Link
                  href={`/groups/${groupId}/settings`}
                  className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
                >
                  設定を変更
                </Link>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600">対局種別</dt>
                <dd className="font-medium">
                  {rules.game_type === "tonpuu" ? "東風戦" : "東南戦"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">開始点</dt>
                <dd className="font-medium">{rules.start_points.toLocaleString()}点</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">返し点</dt>
                <dd className="font-medium">{rules.return_points.toLocaleString()}点</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">レート</dt>
                <dd className="font-medium">{rules.rate}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm text-gray-600">ウマ</dt>
                <dd className="font-medium">
                  {rules.uma_first}/{rules.uma_second}/{rules.uma_third}/{rules.uma_fourth}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div className="text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 hover:underline">
            トップページに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
