import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateGroupRules } from "@/app/actions/groups";
import { createClient } from "@/lib/supabase/server";
import * as groupsRepo from "@/lib/supabase/repositories";

export default async function GroupSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const groupId: string = (await params).id;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // メンバーシップと管理者権限確認
  const membershipResult = await groupsRepo.findGroupMember({ groupId, userId: user.id });

  // メンバーでない、またはエラーの場合は権限チェックできないのでエラー
  if (membershipResult.error || !membershipResult.data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">アクセス権限がありません</h1>
          <p className="text-gray-600">このグループのメンバーである必要があります</p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
          >
            トップページに戻る
          </Link>
        </div>
      </main>
    );
  }

  // 並列でグループ情報とルールを取得
  const [{ data: group }, { data: rules }] = await Promise.all([
    groupsRepo.getGroupName(groupId),
    groupsRepo.getGroupRules(groupId),
  ]);

  if (!group || !rules) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">グループルール設定</h1>
          <p className="text-gray-600">{group.name}</p>
        </div>

        <form action={updateGroupRules as any} className="space-y-6">
          <input type="hidden" name="groupId" value={groupId} />

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

          {/* 開始点 */}
          <div>
            <label htmlFor="startPoints" className="block text-sm font-medium text-gray-700 mb-2">
              開始点 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="startPoints"
              name="startPoints"
              required
              min="1000"
              step="1000"
              defaultValue={rules.start_points}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
          </div>

          {/* 返し点 */}
          <div>
            <label htmlFor="returnPoints" className="block text-sm font-medium text-gray-700 mb-2">
              返し点 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="returnPoints"
              name="returnPoints"
              required
              min="1000"
              step="1000"
              defaultValue={rules.return_points}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
          </div>

          {/* レート */}
          <div>
            <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-2">
              レート <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="rate"
              name="rate"
              required
              min="0.1"
              step="0.1"
              defaultValue={rules.rate}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
          </div>

          {/* ウマ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ウマ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label htmlFor="umaFirst" className="block text-xs text-gray-600 mb-1">
                  1位
                </label>
                <input
                  type="number"
                  id="umaFirst"
                  name="umaFirst"
                  required
                  defaultValue={rules.uma_first}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="umaSecond" className="block text-xs text-gray-600 mb-1">
                  2位
                </label>
                <input
                  type="number"
                  id="umaSecond"
                  name="umaSecond"
                  required
                  defaultValue={rules.uma_second}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="umaThird" className="block text-xs text-gray-600 mb-1">
                  3位
                </label>
                <input
                  type="number"
                  id="umaThird"
                  name="umaThird"
                  required
                  defaultValue={rules.uma_third}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="umaFourth" className="block text-xs text-gray-600 mb-1">
                  4位
                </label>
                <input
                  type="number"
                  id="umaFourth"
                  name="umaFourth"
                  required
                  defaultValue={rules.uma_fourth}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">注意事項</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• ルール変更は既存の対局には影響しません</li>
              <li>• 変更後の対局から新しいルールが適用されます</li>
              <li>• ウマの合計は0になるように設定してください</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              設定を保存
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
