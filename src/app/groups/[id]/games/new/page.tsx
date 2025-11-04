import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createGame } from "@/app/actions/games";
import { requireGroupMembership } from "@/lib/auth/group-access";
import * as groupsRepo from "@/lib/supabase/repositories";
import { createClient } from "@/lib/supabase/server";
import { getPlayerDisplayName } from "@/lib/utils/player";

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
  const { data: rules } = rulesResult;
  const { data: members } = membersResult;
  const { data: guestPlayers } = guestPlayersResult;
  const { data: events } = eventsResult;

  if (!group || !rules) {
    notFound();
  }

  // デフォルトの対局日時（現在時刻）
  const now = new Date();
  const defaultDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  // 座席名のマッピング
  const seatNames = ["東", "南", "西", "北"];

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

        {/* @ts-expect-error - Next.js 15 Server Actions can return data */}
        <form action={createGame} className="space-y-8">
          <input type="hidden" name="groupId" value={groupId} />

          {/* 対局情報 */}
          <div className="rounded-lg border border-gray-200 p-6 space-y-6 bg-white">
            <h2 className="text-lg font-semibold">対局情報</h2>

            {/* イベント選択 */}
            {eventId ? (
              <input type="hidden" name="eventId" value={eventId} />
            ) : (
              events &&
              events.length > 0 && (
                <div>
                  <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-2">
                    イベント（任意）
                  </label>
                  <select
                    id="eventId"
                    name="eventId"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  >
                    <option value="">イベントなし</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name} ({new Date(event.event_date).toLocaleDateString("ja-JP")})
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    イベントに紐付けると、イベント内の対局として記録されます
                  </p>
                </div>
              )
            )}

            {/* 対局種別 */}
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-2">
                対局種別 <span className="text-red-500">*</span>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gameType"
                    value="tonpuu"
                    defaultChecked={rules.game_type === "tonpuu"}
                    className="mr-2"
                  />
                  東風戦
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gameType"
                    value="tonnan"
                    defaultChecked={rules.game_type === "tonnan"}
                    className="mr-2"
                  />
                  東南戦
                </label>
              </div>
            </div>

            {/* 対局日時 */}
            <div>
              <label htmlFor="playedAt" className="block text-sm font-medium text-gray-700 mb-2">
                対局日時 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="playedAt"
                name="playedAt"
                required
                defaultValue={defaultDateTime}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>
          </div>

          {/* プレイヤー情報 */}
          <div className="rounded-lg border border-gray-200 p-6 bg-white">
            <h2 className="text-lg font-semibold mb-6">プレイヤー情報</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg bg-gray-50 p-4 space-y-4">
                  <h3 className="font-medium">{seatNames[i - 1]}</h3>

                  {/* プレイヤー選択 */}
                  <div>
                    <label
                      htmlFor={`player${i}Id`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      プレイヤー <span className="text-red-500">*</span>
                    </label>
                    <select
                      id={`player${i}Id`}
                      name={`player${i}Id`}
                      required
                      defaultValue={defaultPlayers[i - 1] || ""}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    >
                      <option value="">選択してください</option>
                      <optgroup label="メンバー">
                        {members?.map((member) => (
                          <option key={member.user_id} value={member.user_id}>
                            {getPlayerDisplayName(member)}
                          </option>
                        ))}
                      </optgroup>
                      {guestPlayers && guestPlayers.length > 0 && (
                        <optgroup label="ゲストメンバー">
                          {guestPlayers.map((guest) => (
                            <option key={`guest-${guest.id}`} value={`guest-${guest.id}`}>
                              {guest.name} (ゲスト)
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  {/* 最終持ち点 */}
                  <div>
                    <label
                      htmlFor={`player${i}FinalPoints`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      最終持ち点 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id={`player${i}FinalPoints`}
                      name={`player${i}FinalPoints`}
                      required
                      step="100"
                      defaultValue={rules.start_points}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">注意事項</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• 4人のプレイヤーをすべて選択してください</li>
              <li>• スコアは自動的に計算されます</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              対局を登録
            </button>
            <Link
              href={eventId ? `/groups/${groupId}/events/${eventId}` : `/groups/${groupId}`}
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
