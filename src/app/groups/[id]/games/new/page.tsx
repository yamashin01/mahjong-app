import { notFound, redirect } from "next/navigation";
import { requireGroupMembership } from "@/lib/auth/group-access";
import * as groupsRepo from "@/lib/supabase/repositories";
import * as eventsRepo from "@/lib/supabase/repositories/events";
import { createClient } from "@/lib/supabase/server";
import { GameForm } from "./components/game-form";

export default async function NewGamePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ eventId?: string }>;
}) {
  const groupId: string = (await params).id;
  const { eventId } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // メンバーシップ確認（404を返す）
  await requireGroupMembership(groupId, user.id);

  // 全データを並列取得
  const [groupResult, rulesResult, membersResult, guestPlayersResult, eventsResult] =
    await Promise.all([
      groupsRepo.getGroupName(groupId),
      groupsRepo.getGroupRules(groupId),
      groupsRepo.getGroupMemberNames(groupId),
      groupsRepo.getGroupGuestPlayers(groupId),
      groupsRepo.getActiveGroupEvents(groupId),
    ]);

  const { data: group } = groupResult;
  const { data: groupRules } = rulesResult;
  const { data: members } = membersResult;
  const { data: guestPlayers } = guestPlayersResult;
  const { data: events } = eventsResult;

  if (!group || !groupRules) {
    notFound();
  }

  // イベント指定がある場合、イベントルールを取得
  let eventRules = null;
  if (eventId) {
    const { data: event } = await eventsRepo.getEventById(eventId);
    if (event) {
      eventRules = event;
    }
  }

  // 適用するルールを決定（イベントのカスタムルールがあればそれを、なければグループルール）
  const rules = {
    game_type: eventRules?.game_type ?? groupRules.game_type,
    start_points: eventRules?.start_points ?? groupRules.start_points,
    return_points: eventRules?.return_points ?? groupRules.return_points,
    uma_first: eventRules?.uma_first ?? groupRules.uma_first,
    uma_second: eventRules?.uma_second ?? groupRules.uma_second,
    uma_third: eventRules?.uma_third ?? groupRules.uma_third,
    uma_fourth: eventRules?.uma_fourth ?? groupRules.uma_fourth,
    oka_enabled: eventRules?.oka_enabled ?? groupRules.oka_enabled,
    rate: eventRules?.rate ?? groupRules.rate,
  };

  // デフォルトの対局日時（現在時刻）
  const now = new Date();
  const defaultDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  // デフォルトプレイヤーの設定（メンバー登録順、不足分はゲストメンバー）
  const defaultPlayers: (string | null)[] = [];

  // メンバーを最大4人まで追加
  if (members) {
    for (let i = 0; i < Math.min(4, members.length); i++) {
      defaultPlayers.push(members[i].user_id);
    }
  }

  // メンバーが4人未満の場合、ゲストメンバーで埋める
  if (defaultPlayers.length < 4 && guestPlayers) {
    const remainingSlots = 4 - defaultPlayers.length;
    for (let i = 0; i < Math.min(remainingSlots, guestPlayers.length); i++) {
      defaultPlayers.push(`guest-${guestPlayers[i].id}`);
    }
  }

  // まだ4人未満の場合はnullで埋める
  while (defaultPlayers.length < 4) {
    defaultPlayers.push(null);
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">対局記録</h1>
          <p className="text-gray-600">{group.name}</p>
        </div>

        <GameForm
          groupId={groupId}
          eventId={eventId}
          rules={rules}
          defaultDateTime={defaultDateTime}
          members={members}
          guestPlayers={guestPlayers}
          events={events}
          defaultPlayers={defaultPlayers}
        />
      </div>
    </main>
  );
}
