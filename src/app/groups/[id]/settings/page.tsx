import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateGroupRules } from "@/app/actions/groups";
import * as groupsRepo from "@/lib/supabase/repositories";
import { createClient } from "@/lib/supabase/server";
import { PointsInputs } from "./components/points-inputs";
import { UmaInputs } from "./components/uma-inputs";

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

        {/* @ts-expect-error - Next.js 15 Server Actions can return data */}
        <form action={updateGroupRules} className="space-y-6">
          <input type="hidden" name="groupId" value={groupId} />

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

          {/* 開始点、返し点、レート */}
          <PointsInputs
            defaultStartPoints={rules.start_points}
            defaultReturnPoints={rules.return_points}
            defaultRate={rules.rate}
          />

          {/* ウマ */}
          <UmaInputs defaultFirst={rules.uma_first} defaultSecond={rules.uma_second} />

          <div className="rounded-lg bg-yellow-50 p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">注意事項</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• ルール変更は既存の対局には影響しません</li>
              <li>• 変更後の対局から新しいルールが適用されます</li>
              <li>• ウマは点棒で1000点単位で指定します（例: 1位=20000点、2位=10000点）</li>
              <li>• 3位と4位は自動的に計算されます（3位=-2位、4位=-1位）</li>
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
