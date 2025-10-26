import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function GroupsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ユーザーが参加しているグループを取得
  const { data: memberships, error } = await supabase
    .from("group_members")
    .select(
      `
      group_id,
      role,
      joined_at,
      groups (
        id,
        name,
        description,
        invite_code,
        created_at
      )
    `,
    )
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  if (error) {
    console.error("Error fetching groups:", error);
  }

  const groups = memberships?.map((m) => ({
    ...(m.groups as any),
    role: m.role,
    joined_at: m.joined_at,
  }));

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">グループ一覧</h1>
          <Link
            href="/groups/new"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
          >
            新規グループ作成
          </Link>
        </div>

        {groups && groups.length > 0 ? (
          <div className="grid gap-4">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="block rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
                    {group.description && <p className="text-gray-600 mb-3">{group.description}</p>}
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>
                        招待コード:{" "}
                        <code className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {group.invite_code}
                        </code>
                      </span>
                      <span>参加日: {new Date(group.joined_at).toLocaleDateString("ja-JP")}</span>
                    </div>
                  </div>
                  <div>
                    {group.role === "admin" && (
                      <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                        管理者
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              参加しているグループがありません
            </h2>
            <p className="text-gray-500 mb-6">
              新しいグループを作成するか、招待コードで参加してください
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/groups/new"
                className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
              >
                新規グループ作成
              </Link>
              <Link
                href="/groups/join"
                className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition-colors"
              >
                招待コードで参加
              </Link>
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <Link href="/" className="text-blue-600 hover:text-blue-700 hover:underline">
            トップページに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
