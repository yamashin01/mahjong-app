"use client";

import { signOut } from "./actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
      >
        ログアウト
      </button>
    </form>
  );
}
