"use client";

import { MoreVertical } from "lucide-react";
import { deleteEvent } from "@/app/actions/events";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type EventActionsMenuProps = {
  eventId: string;
  groupId: string;
};

export function EventActionsMenu({ eventId, groupId }: EventActionsMenuProps) {
  const handleDelete = async () => {
    if (!confirm("イベントを削除してもよろしいですか?")) {
      return;
    }

    const formData = new FormData();
    formData.append("eventId", eventId);
    formData.append("groupId", groupId);

    await deleteEvent(formData);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          aria-label="イベント操作メニュー"
        >
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          削除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
