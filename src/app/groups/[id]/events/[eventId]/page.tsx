import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateEventStatus } from "@/app/actions/events";
import { EventRulesDisplay } from "@/app/components/event-rules-display";
import { requireGroupMembership } from "@/lib/auth/group-access";
import * as groupsRepo from "@/lib/supabase/repositories";
import { createClient } from "@/lib/supabase/server";
import { getPlayerDisplayName } from "@/lib/utils/player";
import type { EventRules } from "@/types/event-rules";
import { EditEventName } from "./components/edit-event-name";
import { EventActionsMenu } from "./components/event-actions-menu";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const { id: groupId, eventId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // メンバーシップ確認
  const membership = await requireGroupMembership(groupId, user.id);
  const isAdmin = membership.role === "admin";

  // イベント情報、グループ情報、グループルールを並列取得
  const [eventResult, groupResult, rulesResult] = await Promise.all([
    groupsRepo.getEventById(eventId),
    groupsRepo.getGroupName(groupId),
    groupsRepo.getGroupRules(groupId),
  ]);

  const { data: event, error: eventError } = eventResult;
  const { data: group } = groupResult;
  const { data: groupRules } = rulesResult;

  if (eventError || !event || !group || !groupRules) {
    notFound();
  }

  // イベントのカスタムルールを抽出
  const eventRules: EventRules = {
    game_type: event.game_type,
    start_points: event.start_points,
    return_points: event.return_points,
    uma_first: event.uma_first,
    uma_second: event.uma_second,
    uma_third: event.uma_third,
    uma_fourth: event.uma_fourth,
    oka_enabled: event.oka_enabled,
    rate: event.rate,
    tobi_prize: event.tobi_prize,
    yakuman_prize: event.yakuman_prize,
    top_prize: event.top_prize,
  };

  // イベントに紐づく対局一覧を取得
  const { data: games } = await groupsRepo.getEventGames(eventId);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* パンくずリスト */}
        <div className="text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900 hover:underline">
            トップ
          </Link>
          {" / "}
          <Link href={`/groups/${groupId}`} className="hover:text-gray-900 hover:underline">
            {group.name}
          </Link>
          {" / "}
          <span className="text-gray-900">{event.name}</span>
        </div>

        {/* イベント情報 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <div className="mb-4">
            {/* モバイル: イベント名の上に右寄せでバッジと3点リーダー */}
            <div className="flex items-center justify-end gap-2 mb-2 md:hidden">
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                  event.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {event.status === "active" ? "進行中" : "完了"}
              </span>
              {isAdmin && <EventActionsMenu eventId={eventId} groupId={groupId} />}
            </div>

            {/* デスクトップ: 横並びレイアウト */}
            <div className="hidden md:flex md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {isAdmin ? (
                    <EditEventName eventId={eventId} groupId={groupId} currentName={event.name} />
                  ) : (
                    <h1 className="text-3xl font-bold">{event.name}</h1>
                  )}
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                      event.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {event.status === "active" ? "進行中" : "完了"}
                  </span>
                </div>
              </div>
              {isAdmin && (
                <div className="ml-4">
                  <EventActionsMenu eventId={eventId} groupId={groupId} />
                </div>
              )}
            </div>

            {/* モバイル: イベント名を独立表示 */}
            <div className="md:hidden mb-2">
              {isAdmin ? (
                <EditEventName eventId={eventId} groupId={groupId} currentName={event.name} />
              ) : (
                <h1 className="text-3xl font-bold">{event.name}</h1>
              )}
            </div>

            <p className="text-gray-600">
              開催日: {new Date(event.event_date).toLocaleDateString("ja-JP")}
            </p>
            {event.description && <p className="text-gray-700 mt-2">{event.description}</p>}
          </div>
        </div>

        {/* 対局記録 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">対局記録</h2>
          </div>
          <div className="items-center text-center mb-4">
            {event.status === "active" && (
              <Link
                href={`/groups/${groupId}/games/new?eventId=${eventId}`}
                className="block w-full rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 transition-colors"
              >
                対局記録を追加
              </Link>
            )}
          </div>

          {games && games.length > 0 ? (
            <div className="space-y-3">
              {games.map((game) => {
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
              {event.status === "active" && (
                <p className="text-sm mt-2">「対局記録を追加」ボタンから対局を記録してください</p>
              )}
            </div>
          )}
        </div>

        {/* ルール表示 */}
        <EventRulesDisplay eventRules={eventRules} groupRules={groupRules} />

        {/* 管理者用操作 */}
        {isAdmin && (
          <div className="w-full flex flex-col gap-y-4">
            <Link
              href={`/groups/${groupId}/events/${eventId}/settings`}
              className="rounded-lg w-full bg-gray-100 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 transition-colors text-center"
            >
              ルール設定
            </Link>
            {event.status === "active" && (
              // @ts-expect-error - Next.js 15 Server Actions can return data
              <form action={updateEventStatus}>
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="status" value="completed" />
                <button
                  type="submit"
                  className="rounded-lg w-full bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
                >
                  終了する
                </button>
              </form>
            )}
            {event.status === "completed" && (
              // @ts-expect-error - Next.js 15 Server Actions can return data
              <form action={updateEventStatus}>
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="status" value="active" />
                <button
                  type="submit"
                  className="rounded-lg w-full bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 transition-colors"
                >
                  再開する
                </button>
              </form>
            )}
          </div>
        )}

        <div className="text-center">
          <Link
            href={`/groups/${groupId}`}
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            グループページに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
