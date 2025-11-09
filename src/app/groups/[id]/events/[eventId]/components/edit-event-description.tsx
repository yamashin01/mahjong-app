"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiEdit2, FiX } from "react-icons/fi";
import { updateEventDescription } from "@/app/actions/events";

interface EditEventDescriptionProps {
  eventId: string;
  groupId: string;
  currentDescription: string | null;
}

export function EditEventDescription({
  eventId,
  groupId,
  currentDescription,
}: EditEventDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentDescription || "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setValue(currentDescription || "");
  }, [currentDescription]);

  const handleSave = async () => {
    if (value.trim() === (currentDescription || "")) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("eventId", eventId);
    formData.append("groupId", groupId);
    formData.append("description", value.trim());

    const result = await updateEventDescription(formData);

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setValue(currentDescription || "");
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2 w-full">
        <div className="flex flex-col gap-2 w-full">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 text-gray-700 border-2 border-blue-500 rounded-md focus:outline-none resize-none"
            disabled={isLoading}
            maxLength={500}
            rows={3}
            placeholder="イベントの説明を入力してください（任意）"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {value.length}/500文字
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                title="保存"
              >
                <FiCheck className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                title="キャンセル"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2">
      <p className="text-gray-700 flex-1">
        {currentDescription || "説明なし"}
      </p>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="p-1.5 opacity-0 group-hover:opacity-100 text-gray-600 hover:bg-gray-100 rounded-lg transition-all shrink-0"
        title="編集"
      >
        <FiEdit2 className="w-4 h-4" />
      </button>
    </div>
  );
}
