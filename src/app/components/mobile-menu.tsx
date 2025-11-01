"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signOut } from "@/app/actions/auth";

interface MobileMenuProps {
  userEmail?: string;
  avatarUrl?: string | null;
  displayName?: string | null;
}

export function MobileMenu({ userEmail, avatarUrl, displayName }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* アバターボタン（モバイル） */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-full transition-all hover:opacity-80"
        aria-label="メニュー"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName || "ユーザーアバター"}
            width={40}
            height={40}
            className="rounded-full border-2 border-white shadow-md object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center border-2 border-white shadow-md">
            <span className="text-white font-semibold text-sm">
              {displayName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
        )}
      </button>

      {/* モバイルメニュー（オーバーレイ） */}
      {isOpen && (
        <>
          {/* 背景オーバーレイ */}
          <button
            type="button"
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="メニューを閉じる"
          />

          {/* メニュー本体 */}
          <div className="fixed top-16 right-0 w-72 bg-white shadow-lg rounded-l-lg z-50 md:hidden">
            <nav className="p-4 space-y-2">
              {/* ユーザー情報 */}
              <div className="px-4 py-3 border-b border-gray-100 mb-2">
                <div className="flex items-center gap-3 mb-3">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName || "ユーザーアバター"}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-emerald-200 object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center border-2 border-emerald-200">
                      <span className="text-white font-semibold text-lg">
                        {displayName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {displayName || "ユーザー"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* メニュー項目 */}
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>プロフィール編集</span>
              </Link>

              <div className="pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>ログアウト</span>
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
