import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">麻雀スコア管理アプリ</h1>
          <p className="text-lg text-gray-600">友人同士の麻雀サークルのスコア記録・管理</p>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">ログイン中: {user.email}</p>
          <div className="flex flex-col gap-3">
            <a
              href="/groups"
              className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
            >
              グループ一覧
            </a>
            <a
              href="/profile"
              className="rounded-lg bg-gray-600 px-6 py-3 text-white hover:bg-gray-700 transition-colors"
            >
              プロファイルを確認
            </a>
            <SignOutButton />
          </div>
        </div>
      </div>
    </main>
  );
}
