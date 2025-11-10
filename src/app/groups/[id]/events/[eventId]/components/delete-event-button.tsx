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
      className="text-sm text-gray-400 hover:text-red-600 transition-colors underline"
    >
      イベントを削除
    </button>
  );
}
