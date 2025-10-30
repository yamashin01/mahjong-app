"use client";

import { useState } from "react";
import { addGuestPlayer } from "@/app/actions/guest-players";

export function GuestPlayerForm({ groupId }: { groupId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await addGuestPlayer(formData);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      setIsOpen(false);
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors w-full"
      >
        ゲストメンバー追加
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="hidden" name="groupId" value={groupId} />

        <div>
          <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
            ゲストメンバー名
          </label>
          <input
            type="text"
            id="guestName"
            name="name"
            required
            placeholder="山田太郎"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "追加中..." : "追加"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setError(null);
            }}
            className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
