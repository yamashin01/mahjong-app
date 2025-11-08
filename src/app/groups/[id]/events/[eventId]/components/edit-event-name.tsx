"use client";

import { updateEventName } from "@/app/actions/events";
import { EditInlineText } from "@/components/edit-inline-text";

interface EditEventNameProps {
  eventId: string;
  groupId: string;
  currentName: string;
}

export function EditEventName({ eventId, groupId, currentName }: EditEventNameProps) {
  const handleSave = async (name: string) => {
    const formData = new FormData();
    formData.append("eventId", eventId);
    formData.append("groupId", groupId);
    formData.append("name", name);

    const result = await updateEventName(formData);
    return result || {};
  };

  return (
    <EditInlineText
      currentValue={currentName}
      onSave={handleSave}
      placeholder="イベント名を入力してください"
    />
  );
}
