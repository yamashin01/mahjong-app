import Link from "next/link";
import { MobileMenu } from "@/app/components/mobile-menu";
import { UserMenu } from "@/app/components/user-menu";
import { createClient } from "@/lib/supabase/server";
import * as profileRepo from "@/lib/supabase/repositories";

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ユーザーが未認証の場合はヘッダーを表示しない
  if (!user) {
    return null;
  }

  // プロフィール情報取得
  const { data: profile } = await profileRepo.getProfileById(user.id);

  return (
    <header className="bg-emerald-100 shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
            麻雀スコア管理
          </Link>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex items-center gap-3">
            <UserMenu
              userEmail={user.email}
              avatarUrl={profile?.avatar_url}
              displayName={profile?.display_name}
            />
          </div>

          {/* モバイルメニュー */}
          <MobileMenu
            userEmail={user.email}
            avatarUrl={profile?.avatar_url}
            displayName={profile?.display_name}
          />
        </div>
      </div>
    </header>
  );
}
