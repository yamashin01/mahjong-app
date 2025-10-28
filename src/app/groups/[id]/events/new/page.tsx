import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createEvent } from "@/app/actions/events";
import { requireGroupMembership } from "@/lib/auth/group-access";
import { createClient } from "@/lib/supabase/server";

export default async function NewEventPage({ params }: { params: Promise<{ id: string }> }) {
  const groupId: string = (await params).id;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // メンバーシップ確認
  await requireGroupMembership(groupId, user.id);

  // グループ情報を取得
  const { data: group } = await supabase.from("groups").select("name").eq("id", groupId).single();

  if (!group) {
    notFound();
  }

  // デフォルトのイベント日（今日）
  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">イベント作成</h1>
          <p className="text-gray-600">{group.name}</p>
        </div>

        <form action={createEvent as any} className="space-y-8">
          <input type="hidden" name="groupId" value={groupId} />

          <div className="rounded-lg border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold">イベント情報</h2>

            {/* イベント名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                イベント名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="例: 3月度月例大会"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            {/* 開催日 */}
            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                開催日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                required
                defaultValue={defaultDate}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            {/* 説明 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                説明（任意）
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="イベントの詳細や注意事項など"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
              />
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900 mb-2">イベントについて</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• イベント作成後、対局記録時にイベントに紐付けることができます</li>
              <li>• イベント内の対局は個別にルール変更が可能です</li>
              <li>• イベントを「完了」にすると、成績が確定します</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              イベントを作成
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
