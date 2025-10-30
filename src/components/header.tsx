import Link from "next/link";
import { SignOutButton } from "@/app/sign-out-button";
import { MobileMenu } from "@/app/mobile-menu";

export function Header() {
  return (
    <header className="bg-emerald-100 shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
            麻雀スコア管理
          </Link>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/profile"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
            >
              プロフィール編集
            </Link>
            <SignOutButton />
          </div>

          {/* モバイルメニュー */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
