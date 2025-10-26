import Link from "next/link";
import { redirect } from "next/navigation";
import { createGroup } from "@/app/actions/groups";
import { createClient } from "@/lib/supabase/server";

export default async function NewGroupPage() {
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
          <h1 className="text-3xl font-bold mb-2">新規グループ作成</h1>
          <p className="text-gray-600">麻雀サークルのグループを作成しましょう</p>
        </div>

        <form action={createGroup as any} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              グループ名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              maxLength={50}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              placeholder="例: 金曜麻雀会"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              説明（任意）
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
              placeholder="グループの説明を入力してください"
            />
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900 mb-2">グループ作成後の設定</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• デフォルトのルール設定が自動的に作成されます</li>
              <li>• 招待コードが自動生成されます</li>
              <li>• あなたが管理者として登録されます</li>
              <li>• ルール設定は後から変更できます</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              グループを作成
            </button>
            <Link
              href="/groups"
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
