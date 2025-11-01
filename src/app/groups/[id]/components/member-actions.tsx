"use client";

import { useState } from "react";
import { removeMember, updateMemberRole } from "@/app/actions/groups";

export function MemberActions({
  groupId,
  userId,
  currentRole,
  isCurrentUser,
}: {
  groupId: string;
  userId: string;
  currentRole: "admin" | "member";
  isCurrentUser: boolean;
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (isCurrentUser) {
    return null; // 自分自身には操作を表示しない
  }

  const handleRemove = async () => {
    if (!confirm("このメンバーをグループから削除しますか？")) {
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("groupId", groupId);
    formData.append("userId", userId);

    const result = await removeMember(formData);
    setIsProcessing(false);

    if (result?.error) {
      alert(result.error);
    }
  };

  const handleRoleChange = async () => {
    const newRole = currentRole === "admin" ? "member" : "admin";
    const action = newRole === "admin" ? "管理者に昇格" : "メンバーに降格";

    if (!confirm(`このメンバーを${action}しますか？`)) {
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("groupId", groupId);
    formData.append("userId", userId);
    formData.append("role", newRole);

    const result = await updateMemberRole(formData);
    setIsProcessing(false);

    if (result?.error) {
      alert(result.error);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleRoleChange}
        disabled={isProcessing}
        className="text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
      >
        {currentRole === "admin" ? "降格" : "管理者に昇格"}
      </button>
      <button
        type="button"
        onClick={handleRemove}
        disabled={isProcessing}
        className="text-sm text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
      >
        削除
      </button>
    </div>
  );
}
