"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiEdit2, FiX } from "react-icons/fi";
import { updateEventName } from "@/app/actions/events";

interface EditEventNameProps {
  eventId: string;
  groupId: string;
  currentName: string;
}

export function EditEventName({ eventId, groupId, currentName }: EditEventNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("イベント名を入力してください");
      return;
    }

    if (name.trim() === currentName) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("eventId", eventId);
    formData.append("groupId", groupId);
    formData.append("name", name.trim());

    const result = await updateEventName(formData);

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setName(currentName);
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-3xl font-bold border-b-2 border-blue-500 focus:outline-none"
            disabled={isLoading}
            maxLength={100}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            title="保存"
          >
            <FiCheck className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="キャンセル"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <h1 className="text-3xl font-bold">{currentName}</h1>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="イベント名を編集"
      >
        <FiEdit2 className="w-5 h-5" />
      </button>
    </div>
  );
}
