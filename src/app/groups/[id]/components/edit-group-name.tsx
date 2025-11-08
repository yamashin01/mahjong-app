"use client";

import { updateGroupName } from "@/app/actions/groups";
import { EditInlineText } from "@/components/edit-inline-text";

interface EditGroupNameProps {
  groupId: string;
  currentName: string;
}

export function EditGroupName({ groupId, currentName }: EditGroupNameProps) {
  const handleSave = async (name: string) => {
    const formData = new FormData();
    formData.append("groupId", groupId);
    formData.append("name", name);

    const result = await updateGroupName(formData);
    return result || {};
  };

  return (
    <EditInlineText
      currentValue={currentName}
      onSave={handleSave}
      placeholder="グループ名を入力してください"
    />
  );
}
