import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GoPerson } from "react-icons/go";
import { EventRulesDisplay } from "@/app/components/event-rules-display";
import { requireGroupMembership } from "@/lib/auth/group-access";
import * as groupsRepo from "@/lib/supabase/repositories";
import { createClient } from "@/lib/supabase/server";
import { getPlayerAvatarUrl, getPlayerDisplayName, hasPlayerAvatar } from "@/lib/utils/player";
import { CopyButton } from "./components/copy-button";
import { EditGroupName } from "./components/edit-group-name";
import { EventsSection } from "./components/events-section";
import { GuestPlayerActions } from "./components/guest-player-actions";
import { GuestPlayerForm } from "./components/guest-player-form";
import { MemberActions } from "./components/member-actions";

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

  const [membersResult, { data: rules }, gamesResult, { data: guestPlayers }, eventsResult] =
    await Promise.all([
      groupsRepo.getGroupMembers(groupId),
      groupsRepo.getGroupRules(groupId),
      groupsRepo.getRecentGames({ groupId, limit: 5 }),
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

  // 総プレイヤー数（メンバー + ゲスト）
  const totalPlayers = (members?.length || 0) + (guestPlayers?.length || 0);
  const hasEnoughPlayers = totalPlayers >= 4;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          {/* モバイル: 管理者バッジを右上に表示 */}
          {isAdmin && (
            <div className="flex justify-end mb-2 md:hidden">
              <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800">
                管理者
              </span>
            </div>
          )}

          {/* デスクトップ: 横並びレイアウト */}
          <div className="hidden md:flex md:items-start md:justify-between">
            <div className="flex-1">
              {isAdmin ? (
                <div className="mb-2">
                  <EditGroupName groupId={groupId} currentName={group.name} />
                </div>
              ) : (
                <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              )}
              {group.description && <p className="text-gray-600">{group.description}</p>}
            </div>
            {isAdmin && (
              <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800">
                管理者
              </span>
            )}
          </div>

          {/* モバイル: グループ名と説明を独立表示 */}
          <div className="md:hidden">
            {isAdmin ? (
              <div className="mb-2">
                <EditGroupName groupId={groupId} currentName={group.name} />
              </div>
            ) : (
              <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
            )}
            {group.description && <p className="text-gray-600">{group.description}</p>}
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {members?.map((member) => (
              <div
                key={member.user_id}
                className="relative rounded-lg border border-gray-200 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  {hasPlayerAvatar(member) ? (
                    <Image
                      src={getPlayerAvatarUrl(member)!}
                      alt={getPlayerDisplayName(member)}
                      width={64}
                      height={64}
                      className="rounded-full mb-3"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 mb-3" />
                  )}
                  <p className="font-medium text-base mb-1">{getPlayerDisplayName(member)}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    参加日: {new Date(member.joined_at).toLocaleDateString("ja-JP")}
                  </p>
                  {member.role === "admin" && (
                    <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                      管理者
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <div className="absolute top-2 right-2">
                    <MemberActions
                      groupId={groupId}
                      userId={member.user_id}
                      currentRole={member.role as "admin" | "member"}
                      isCurrentUser={member.user_id === user.id}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ゲストメンバー */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              ゲストメンバー ({guestPlayers?.length || 0}人)
            </h2>
          </div>
          {guestPlayers && guestPlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {guestPlayers.map((guest) => (
                <div
                  key={guest.id}
                  className="relative rounded-lg border border-gray-200 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-full flex items-center justify-center bg-gray-300 mb-3">
                      <GoPerson className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="font-medium text-base mb-1">{guest.name}</p>
                    <p className="text-xs text-gray-500">
                      追加日: {new Date(guest.created_at!).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="absolute top-2 right-2">
                      <GuestPlayerActions
                        groupId={groupId}
                        guestPlayerId={guest.id}
                        guestPlayerName={guest.name}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 mb-4">
              <p>ゲストメンバーはいません</p>
              {isAdmin && (
                <p className="text-sm mt-2">「ゲストメンバー追加」ボタンから追加できます</p>
              )}
            </div>
          )}
          {isAdmin && <GuestPlayerForm groupId={groupId} />}
        </div>

        {/* イベント */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <EventsSection
            groupId={groupId}
            events={events || []}
            isAdmin={isAdmin}
            totalPlayers={totalPlayers}
          />
        </div>

        {/* 対局記録 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">対局記録</h2>
          </div>
          <div className="w-full my-4">
            {hasEnoughPlayers ? (
              <Link
                href={`/groups/${groupId}/games/new`}
                className="block w-full rounded-lg bg-gray-100 px-4 py-2 text-sm text-center text-gray-800 hover:bg-gray-200 transition-colors"
              >
                新規対局を記録
              </Link>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled
                  className="block w-full rounded-lg bg-gray-300 px-4 py-2 text-sm text-center text-gray-500 cursor-not-allowed"
                >
                  新規対局を記録
                </button>
                <p className="text-xs text-red-600 text-center">
                  対局を記録するには、メンバーまたはゲストを合わせて4人以上必要です（現在
                  {totalPlayers}
                  人）
                </p>
              </div>
            )}
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

        {/* グループルール */}
        {rules && (
          <EventRulesDisplay
            eventRules={{
              game_type: null,
              start_points: null,
              return_points: null,
              uma_first: null,
              uma_second: null,
              uma_third: null,
              uma_fourth: null,
              oka_enabled: null,
              rate: null,
              tobi_prize: null,
              yakuman_prize: null,
              yakitori_prize: null,
              top_prize: null,
            }}
            groupRules={rules}
            groupId={groupId}
            eventId=""
          />
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
