"use client";

import { useEffect, useRef, useState } from "react";
import { HiDotsVertical } from "react-icons/hi";
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  if (isCurrentUser) {
    return null; // 自分自身には操作を表示しない
  }

  const handleRemove = async () => {
    setIsOpen(false);
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
    setIsOpen(false);
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
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isProcessing}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        title="メンバー操作"
      >
        <HiDotsVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              type="button"
              onClick={handleRoleChange}
              disabled={isProcessing}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentRole === "admin" ? "メンバーに降格" : "管理者に昇格"}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isProcessing}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              グループから削除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
