"use client";

import { useState } from "react";
import { deleteGuestPlayer } from "@/app/actions/guest-players";

export function GuestPlayerActions({
  groupId,
  guestPlayerId,
  guestPlayerName,
}: {
  groupId: string;
  guestPlayerId: string;
  guestPlayerName: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`「${guestPlayerName}」を削除しますか？`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteGuestPlayer(guestPlayerId, groupId);

    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-lg bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
    >
      {isDeleting ? "削除中..." : "削除"}
    </button>
  );
}
