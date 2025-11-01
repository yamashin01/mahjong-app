"use client";

import Link from "next/link";
import { useState } from "react";
import { GoGear } from "react-icons/go";
import { FaPlus } from "react-icons/fa";
import { IoMdPersonAdd } from "react-icons/io";

export function MobileAddGroupMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="メニュー"
      >
        <GoGear className="w-6 h-6">
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </GoGear>
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
                href="/groups/new"
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FaPlus className="w-6 h-6" />
                  <span>新規作成</span>
                </div>
              </Link>
              <Link
                href="/groups/join"
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <IoMdPersonAdd className="w-6 h-6" />
                  <span>招待コードで参加</span>
                </div>
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
