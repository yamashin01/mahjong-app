"use client";

import Link from "next/link";
import { useState } from "react";
import { SignOutButton } from "./sign-out-button";
import { GiHamburgerMenu } from "react-icons/gi";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ハンバーガーボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="メニュー"
      >
        <GiHamburgerMenu className="w-6 h-6" />
      </button>

      {/* モバイルメニュー（オーバーレイ） */}
      {isOpen && (
        <>
          {/* 背景オーバーレイ */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* メニュー本体 */}
          <div className="fixed top-16 right-0 w-64 bg-white shadow-lg rounded-l-lg z-50 md:hidden">
            <nav className="p-4 space-y-2">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>プロフィール編集</span>
                </div>
              </Link>

              <div className="pt-2 border-t border-gray-200">
                  <SignOutButton variant="mobile" />
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
