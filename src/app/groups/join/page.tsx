import Link from "next/link";
import { redirect } from "next/navigation";
import { joinGroup } from "@/app/actions/groups";
import { createClient } from "@/lib/supabase/server";

export default async function JoinGroupPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">グループに参加</h1>
          <p className="text-gray-600">招待コードを入力してグループに参加しましょう</p>
        </div>

        <form action={joinGroup as any} className="space-y-6">
          <div>
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
              招待コード <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="inviteCode"
              name="inviteCode"
              required
              maxLength={8}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl font-mono font-bold uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              placeholder="ABC123XY"
            />
            <p className="text-sm text-gray-600 mt-2">
              グループの管理者から共有された8桁の招待コードを入力してください
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900 mb-2">参加後の設定</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• グループのメンバーとして登録されます</li>
              <li>• グループのルール設定を閲覧できます</li>
              <li>• 対局の記録と閲覧が可能になります</li>
              <li>• ランキングに表示されます</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              グループに参加
            </button>
            <Link
              href="/"
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
