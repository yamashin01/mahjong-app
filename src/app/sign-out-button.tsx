"use client";

import { signOut } from "./actions/auth";

interface SignOutButtonProps {
  variant?: "default" | "mobile";
}

export function SignOutButton({ variant = "default" }: SignOutButtonProps) {
  if (variant === "mobile") {
    return (
      <form action={signOut}>
        <button
          type="submit"
          className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
        >
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>ログアウト</span>
        </button>
      </form>
    );
  }

  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-lg bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600 transition-colors"
      >
        ログアウト
      </button>
    </form>
  );
}
