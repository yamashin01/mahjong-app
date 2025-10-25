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
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
