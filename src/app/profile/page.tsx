import Link from "next/link";
import { redirect } from "next/navigation";
import { updateProfile } from "@/app/actions/profile";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // プロファイルデータを取得
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  // 参加グループ一覧を取得
  const { data: memberships } = await supabase
    .from("group_members")
    .select(
      `
      group_id,
      role,
      joined_at,
      groups (
        id,
        name,
        description
      )
    `,
    )
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  // 個人成績を集計
  const { data: gameResults } = await supabase
    .from("game_results")
    .select("rank, total_score, point_amount")
    .eq("player_id", user.id);

  // 成績統計を計算
  const stats = {
    totalGames: gameResults?.length || 0,
    firstPlace: gameResults?.filter((r) => r.rank === 1).length || 0,
    secondPlace: gameResults?.filter((r) => r.rank === 2).length || 0,
    thirdPlace: gameResults?.filter((r) => r.rank === 3).length || 0,
    fourthPlace: gameResults?.filter((r) => r.rank === 4).length || 0,
    averageRank:
      gameResults && gameResults.length > 0
        ? (gameResults.reduce((sum, r) => sum + r.rank, 0) / gameResults.length).toFixed(2)
        : "0.00",
    totalPoints:
      gameResults && gameResults.length > 0
        ? gameResults.reduce((sum, r) => sum + Number(r.point_amount), 0).toFixed(0)
        : "0",
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">プロフィール</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>

        {/* プロフィール編集 */}
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">プロフィール編集</h2>
          <form action={updateProfile as any} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                表示名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                required
                defaultValue={profile?.display_name || ""}
                placeholder="山田太郎"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-2">
                アバター画像URL（任意）
              </label>
              <input
                type="url"
                id="avatarUrl"
                name="avatarUrl"
                defaultValue={profile?.avatar_url || ""}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
              <p className="text-sm text-gray-500 mt-1">画像のURLを入力してください</p>
            </div>

            {profile?.avatar_url && (
              <div>
                <p className="text-sm text-gray-700 mb-2">現在のアバター:</p>
                <img
                  src={profile.avatar_url}
                  alt="アバター"
                  className="h-20 w-20 rounded-full border-2 border-gray-200"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
          </form>
        </div>

        {/* 個人成績 */}
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">個人成績</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-600">対局数</p>
              <p className="text-2xl font-bold">{stats.totalGames}</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4 text-center">
              <p className="text-sm text-gray-600">1位</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.firstPlace}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-600">平均順位</p>
              <p className="text-2xl font-bold">{stats.averageRank}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-sm text-gray-600">合計ポイント</p>
              <p className="text-2xl font-bold text-green-600">
                {Number(stats.totalPoints) >= 0 ? "+" : ""}¥
                {Number(stats.totalPoints).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-600">1位</p>
              <div className="h-2 bg-yellow-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{
                    width:
                      stats.totalGames > 0
                        ? `${(stats.firstPlace / stats.totalGames) * 100}%`
                        : "0%",
                  }}
                />
              </div>
              <p className="text-xs font-medium mt-1">
                {stats.totalGames > 0
                  ? ((stats.firstPlace / stats.totalGames) * 100).toFixed(0)
                  : 0}
                %
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">2位</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400"
                  style={{
                    width:
                      stats.totalGames > 0
                        ? `${(stats.secondPlace / stats.totalGames) * 100}%`
                        : "0%",
                  }}
                />
              </div>
              <p className="text-xs font-medium mt-1">
                {stats.totalGames > 0
                  ? ((stats.secondPlace / stats.totalGames) * 100).toFixed(0)
                  : 0}
                %
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">3位</p>
              <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400"
                  style={{
                    width:
                      stats.totalGames > 0
                        ? `${(stats.thirdPlace / stats.totalGames) * 100}%`
                        : "0%",
                  }}
                />
              </div>
              <p className="text-xs font-medium mt-1">
                {stats.totalGames > 0
                  ? ((stats.thirdPlace / stats.totalGames) * 100).toFixed(0)
                  : 0}
                %
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">4位</p>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400"
                  style={{
                    width:
                      stats.totalGames > 0
                        ? `${(stats.fourthPlace / stats.totalGames) * 100}%`
                        : "0%",
                  }}
                />
              </div>
              <p className="text-xs font-medium mt-1">
                {stats.totalGames > 0
                  ? ((stats.fourthPlace / stats.totalGames) * 100).toFixed(0)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>

        {/* 参加グループ */}
        <div className="rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">参加グループ ({memberships?.length || 0})</h2>
            <Link
              href="/groups"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              グループ一覧
            </Link>
          </div>

          {memberships && memberships.length > 0 ? (
            <div className="space-y-3">
              {memberships.map((membership: any) => (
                <Link
                  key={membership.group_id}
                  href={`/groups/${membership.groups.id}`}
                  className="block rounded-lg bg-gray-50 p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{membership.groups.name}</p>
                      {membership.groups.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {membership.groups.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {membership.role === "admin" && (
                        <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                          管理者
                        </span>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        参加日: {new Date(membership.joined_at).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>まだグループに参加していません</p>
              <p className="text-sm mt-2">
                <Link href="/groups" className="text-blue-600 hover:underline">
                  グループ一覧
                </Link>
                からグループを作成または参加してください
              </p>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 hover:underline">
            トップページに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
