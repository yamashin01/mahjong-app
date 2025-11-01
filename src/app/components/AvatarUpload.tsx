"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { uploadAvatar } from "@/app/actions/profile";

interface AvatarUploadProps {
  currentAvatar?: string | null;
}

export default function AvatarUpload({ currentAvatar }: AvatarUploadProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("=== アップロード開始 ===");

    const formData = new FormData(event.currentTarget);
    const file = formData.get("avatar") as File;

    console.log("選択されたファイル:", {
      name: file?.name,
      size: file?.size,
      type: file?.type,
    });

    if (!file || file.size === 0) {
      setMessage({ type: "error", text: "ファイルを選択してください" });
      return;
    }

    setMessage(null);

    startTransition(async () => {
      try {
        const result = await uploadAvatar(formData);
        console.log("アップロード結果:", result);

        if (result.error) {
          setMessage({ type: "error", text: result.error });
        } else if (result.success) {
          setMessage({ type: "success", text: "画像をアップロードしました！" });
          // ページをリロードして画像を更新
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error("予期しないエラー:", error);
        setMessage({ type: "error", text: "予期しないエラーが発生しました" });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* 現在の画像表示 */}
      {currentAvatar && (
        <div>
          <Image
            src={currentAvatar}
            alt="現在のアバター"
            width={96}
            height={96}
            className="rounded-full border-2 border-gray-200 object-cover"
          />
        </div>
      )}

      {/* メッセージ表示 */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-green-50 text-green-800 border border-green-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* アップロードフォーム */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/gif,image/webp"
          disabled={isPending}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
        <p className="text-xs text-gray-500">JPEG、PNG、GIF、WebP形式（最大2MB）</p>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPending ? "アップロード中..." : "画像をアップロード"}
        </button>
      </form>
    </div>
  );
}
