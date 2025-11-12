import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import * as groupsRepo from "@/lib/supabase/repositories";
import { createClient } from "@/lib/supabase/server";
import { RulesForm } from "./components/rules-form";

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

        <RulesForm
          groupId={groupId}
          defaultValues={{
            gameType: rules.game_type,
            startPoints: rules.start_points,
            returnPoints: rules.return_points,
            rate: rules.rate,
            umaFirst: rules.uma_first,
            umaSecond: rules.uma_second,
            tobiPrize: rules.tobi_prize || 0,
            yakumanPrize: rules.yakuman_prize || 0,
            yakitoriPrize: rules.yakitori_prize || 0,
            topPrize: rules.top_prize || 0,
          }}
        />

        <div className="rounded-lg bg-yellow-50 p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">注意事項</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• ルール変更は既存の対局には影響しません</li>
            <li>• 変更後の対局から新しいルールが適用されます</li>
            <li>• ウマは点棒で1000点単位で指定します（例: 1位=20000点、2位=10000点）</li>
            <li>• 3位と4位は自動的に計算されます（3位=-2位、4位=-1位）</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Link
            href={`/groups/${groupId}`}
            className="rounded-lg bg-gray-200 px-6 py-3 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
          >
            グループページに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
