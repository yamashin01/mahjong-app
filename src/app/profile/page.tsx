import { redirect } from "next/navigation";
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
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center">プロファイル</h1>

        <div className="rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">ユーザー情報</h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">メールアドレス:</dt>
                <dd className="font-medium">{user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">ユーザーID:</dt>
                <dd className="font-mono text-sm">{user.id}</dd>
              </div>
            </dl>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800">
              <p className="font-semibold">エラー</p>
              <p className="text-sm">{error.message}</p>
            </div>
          )}

          {profile ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">プロファイル情報</h2>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">表示名:</dt>
                  <dd className="font-medium">{profile.display_name || "未設定"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">アバター:</dt>
                  <dd className="font-medium">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="アバター"
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      "未設定"
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">作成日時:</dt>
                  <dd className="text-sm">
                    {new Date(profile.created_at).toLocaleString("ja-JP")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">更新日時:</dt>
                  <dd className="text-sm">
                    {new Date(profile.updated_at).toLocaleString("ja-JP")}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-800">
                <p className="font-semibold">✓ プロファイル自動作成成功</p>
                <p className="text-sm">トリガーによって正しくプロファイルが作成されました</p>
              </div>
            </div>
          ) : (
            !error && (
              <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
                <p className="font-semibold">⚠ プロファイルが見つかりません</p>
                <p className="text-sm">トリガーが実行されていない可能性があります</p>
              </div>
            )
          )}
        </div>

        <div className="text-center">
          <a
            href="/"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
          >
            トップページに戻る
          </a>
        </div>
      </div>
    </main>
  );
}
