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
