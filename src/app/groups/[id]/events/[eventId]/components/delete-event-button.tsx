"use client";

import { deleteEvent } from "@/app/actions/events";

type DeleteEventButtonProps = {
  eventId: string;
  groupId: string;
};

export function DeleteEventButton({ eventId, groupId }: DeleteEventButtonProps) {
  const handleDelete = async () => {
    if (!confirm("イベントを削除してもよろしいですか？")) {
      return;
    }

    const formData = new FormData();
    formData.append("eventId", eventId);
    formData.append("groupId", groupId);

    await deleteEvent(formData);
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors"
    >
      削除
    </button>
  );
}
