"use client";

import { useState, useRef, useEffect } from "react";
import { FiCheck, FiEdit2, FiX } from "react-icons/fi";

interface EditInlineTextProps {
  currentValue: string;
  onSave: (value: string) => Promise<{ error?: string }>;
  placeholder: string;
  maxLength?: number;
  className?: string;
}

export function EditInlineText({
  currentValue,
  onSave,
  placeholder,
  maxLength = 100,
  className = "text-3xl font-bold",
}: EditInlineTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentValue);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue]);

  const handleSave = async () => {
    if (!value.trim()) {
      setError(placeholder);
      return;
    }

    if (value.trim() === currentValue) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await onSave(value.trim());

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setValue(currentValue);
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
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 ${className} border-b-2 border-blue-500 focus:outline-none`}
            disabled={isLoading}
            maxLength={maxLength}
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
    <div className="group flex items-center gap-2">
      <h1 className={className}>{currentValue}</h1>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="p-2 opacity-0 group-hover:opacity-100 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
        title="編集"
      >
        <FiEdit2 className="w-5 h-5" />
      </button>
    </div>
  );
}
