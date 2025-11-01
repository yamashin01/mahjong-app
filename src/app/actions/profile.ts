"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import * as profileRepo from "@/lib/supabase/repositories/profile";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = formData.get("displayName") as string;
  const avatarUrl = formData.get("avatarUrl") as string;

  if (!displayName || displayName.trim() === "") {
    return { error: "表示名を入力してください" };
  }

  // プロフィールを更新
  const { error: updateError } = await profileRepo.updateProfile(user.id, {
    display_name: displayName.trim(),
    avatar_url: avatarUrl?.trim() || null,
  });

  if (updateError) {
    console.error("Error updating profile:", updateError);
    return { error: "プロフィールの更新に失敗しました" };
  }

  revalidatePath("/profile");
  return { success: true };
}

/**
 * アバター画像をアップロードする
 */
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "認証が必要です" };
  }

  // ファイル取得
  const file = formData.get("avatar") as File;

  if (!file || file.size === 0) {
    return { error: "ファイルを選択してください" };
  }

  // ファイルサイズチェック（2MB制限）
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  if (file.size > MAX_FILE_SIZE) {
    return { error: "ファイルサイズは2MB以下にしてください" };
  }

  // ファイルタイプチェック
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "JPEG、PNG、GIF、WebP形式の画像のみアップロード可能です" };
  }

  try {
    // ファイル名生成（ユーザーID/タイムスタンプ.拡張子）
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // 既存の画像を削除（存在する場合）
    const { data: profile } = await profileRepo.getProfileById(user.id);
    if (profile?.avatar_url) {
      // URLからファイルパスを抽出
      const urlParts = profile.avatar_url.split("/avatars/");
      if (urlParts.length > 1) {
        const oldPath = urlParts[1];
        await supabase.storage.from("avatars").remove([oldPath]);
      }
    }

    // 新しい画像をアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { error: "画像のアップロードに失敗しました" };
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(uploadData.path);

    // プロフィールを更新
    const { error: updateError } = await profileRepo.updateProfile(user.id, {
      avatar_url: urlData.publicUrl,
    });

    if (updateError) {
      console.error("Profile update error:", updateError);
      return { error: "プロフィールの更新に失敗しました" };
    }

    revalidatePath("/profile");
    return { success: true, avatarUrl: urlData.publicUrl };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "予期しないエラーが発生しました" };
  }
}
