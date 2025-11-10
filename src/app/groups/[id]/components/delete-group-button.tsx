"use client";

import { deleteGroup } from "@/app/actions/groups";

type DeleteGroupButtonProps = {
  groupId: string;
};

export function DeleteGroupButton({ groupId }: DeleteGroupButtonProps) {
  const handleDelete = async () => {
    if (
      !confirm(
        "グループを削除してもよろしいですか？\n関連するイベントや対局データもすべて削除されます。",
      )
    ) {
      return;
    }

    const formData = new FormData();
    formData.append("groupId", groupId);

    await deleteGroup(formData);
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-sm text-gray-400 hover:text-red-600 transition-colors underline"
    >
      グループを削除
    </button>
  );
}
