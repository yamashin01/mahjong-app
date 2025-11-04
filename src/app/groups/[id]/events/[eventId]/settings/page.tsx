import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateEventRules } from "@/app/actions/events";
import { EventRulesForm } from "@/app/components/event-rules-form";
import { requireGroupMembership } from "@/lib/auth/group-access";
import * as groupsRepo from "@/lib/supabase/repositories";
import { createClient } from "@/lib/supabase/server";
import type { EventRules } from "@/types/event-rules";

export default async function EventSettingsPage({
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

  // メンバーシップ確認（管理者のみ）
  const membership = await requireGroupMembership(groupId, user.id);
  if (membership.role !== "admin") {
    redirect(`/groups/${groupId}/events/${eventId}`);
  }

  // イベント情報、グループ情報、グループルールを取得
  const [eventResult, groupResult, rulesResult] = await Promise.all([
    groupsRepo.getEventById(eventId),
    groupsRepo.getGroupName(groupId),
    groupsRepo.getGroupRules(groupId),
  ]);

  const { data: event } = eventResult;
  const { data: group } = groupResult;
  const { data: groupRules } = rulesResult;

  if (!event || !group || !groupRules) {
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
          <Link
            href={`/groups/${groupId}/events/${eventId}`}
            className="hover:text-gray-900 hover:underline"
          >
            {event.name}
          </Link>
          {" / "}
          <span className="text-gray-900">ルール設定</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">ルール設定</h1>
          <p className="text-gray-600">{event.name}</p>
        </div>

        {/* @ts-expect-error - Next.js 15 Server Actions can return data */}
        <form action={updateEventRules} className="space-y-8">
          <input type="hidden" name="eventId" value={eventId} />

          <div className="rounded-lg border border-gray-200 p-6 space-y-6 bg-white">
            <h2 className="text-lg font-semibold">イベントルール</h2>
            <EventRulesForm groupRules={groupRules} initialRules={eventRules} mode="edit" />
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900 mb-2">ルール設定について</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• イベント専用のルールを設定できます</li>
              <li>• カスタムルールを無効にすると、グループのデフォルトルールが使用されます</li>
              <li>• 既に記録された対局のルールは変更されません</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
            <Link
              href={`/groups/${groupId}/events/${eventId}`}
              className="flex-1 rounded-lg bg-gray-200 px-6 py-3 text-gray-700 font-medium hover:bg-gray-300 transition-colors text-center"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
