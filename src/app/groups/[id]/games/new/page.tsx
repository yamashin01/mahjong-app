import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createGame } from "@/app/actions/games";
import { createClient } from "@/lib/supabase/server";

export default async function NewGamePage({ params }: { params: Promise<{ id: string }> }) {
  const groupId: string = (await params).id;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // メンバーシップ確認
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">アクセス権限がありません</h1>
          <p className="text-gray-600">このグループのメンバーではありません</p>
          <Link
            href="/groups"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
          >
            グループ一覧に戻る
          </Link>
        </div>
      </main>
    );
  }

  // グループ情報を取得
  const { data: group } = await supabase.from("groups").select("name").eq("id", groupId).single();

  if (!group) {
    notFound();
  }

  // グループルールを取得
  const { data: rules } = await supabase
    .from("group_rules")
    .select("*")
    .eq("group_id", groupId)
    .single();

  if (!rules) {
    notFound();
  }

  // グループメンバー一覧を取得
  const { data: members } = await supabase
    .from("group_members")
    .select(
      `
      user_id,
      profiles (
        display_name
      )
    `,
    )
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  // デフォルトの対局日時（現在時刻）
  const now = new Date();
  const defaultDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">対局記録登録</h1>
          <p className="text-gray-600">{group.name}</p>
        </div>

        <form action={createGame as any} className="space-y-8">
          <input type="hidden" name="groupId" value={groupId} />

          {/* 対局情報 */}
          <div className="rounded-lg border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold">対局情報</h2>

            {/* 対局種別 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対局種別 <span className="text-red-500">*</span>
              </label>
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

            {/* 回戦数 */}
            <div>
              <label htmlFor="gameNumber" className="block text-sm font-medium text-gray-700 mb-2">
                回戦数 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="gameNumber"
                name="gameNumber"
                required
                min="1"
                defaultValue="1"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
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

            {/* 役満回数 */}
            <div>
              <label htmlFor="yakumanCount" className="block text-sm font-medium text-gray-700 mb-2">
                役満回数
              </label>
              <input
                type="number"
                id="yakumanCount"
                name="yakumanCount"
                min="0"
                defaultValue="0"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            {/* トビ */}
            <div>
              <label htmlFor="tobiPlayerId" className="block text-sm font-medium text-gray-700 mb-2">
                トビしたプレイヤー（任意）
              </label>
              <select
                id="tobiPlayerId"
                name="tobiPlayerId"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              >
                <option value="">なし</option>
                {members?.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {(member.profiles as any)?.display_name || "名前未設定"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* プレイヤー情報 */}
          <div className="rounded-lg border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold">プレイヤー情報</h2>

            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-4 space-y-4">
                <h3 className="font-medium">プレイヤー{i}</h3>

                {/* プレイヤー選択 */}
                <div>
                  <label htmlFor={`player${i}Id`} className="block text-sm font-medium text-gray-700 mb-2">
                    プレイヤー <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`player${i}Id`}
                    name={`player${i}Id`}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  >
                    <option value="">選択してください</option>
                    {members?.map((member) => (
                      <option key={member.user_id} value={member.user_id}>
                        {(member.profiles as any)?.display_name || "名前未設定"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 座席 */}
                <div>
                  <label htmlFor={`player${i}Seat`} className="block text-sm font-medium text-gray-700 mb-2">
                    座席 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`player${i}Seat`}
                    name={`player${i}Seat`}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  >
                    <option value="">選択してください</option>
                    <option value="east">東</option>
                    <option value="south">南</option>
                    <option value="west">西</option>
                    <option value="north">北</option>
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
                    min="0"
                    step="100"
                    defaultValue={rules.start_points}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-yellow-50 p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">注意事項</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• 4人のプレイヤーをすべて選択してください</li>
              <li>• 座席は重複しないように設定してください</li>
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
              href={`/groups/${groupId}`}
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
