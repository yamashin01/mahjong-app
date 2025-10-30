"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/auth/group-access";
import { createClient } from "@/lib/supabase/server";
import * as guestPlayersRepo from "@/lib/supabase/repositories/guest-players";

export async function addGuestPlayer(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const groupId = formData.get("groupId") as string;
  const name = formData.get("name") as string;

  if (!groupId || !name || name.trim() === "") {
    return { error: "グループIDと名前を入力してください" };
  }

  // 管理者権限チェック
  try {
    await requireAdminRole(groupId, user.id);
  } catch {
    return { error: "管理者のみがゲストメンバーを追加できます" };
  }

  // ゲストメンバー追加
  const { error: insertError } = await guestPlayersRepo.addGuestPlayer({
    groupId,
    name: name.trim(),
  });

  if (insertError) {
    console.error("Error adding guest player:", insertError);
    return { error: "ゲストメンバーの追加に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}

export async function deleteGuestPlayer(guestPlayerId: string, groupId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 管理者権限チェック
  try {
    await requireAdminRole(groupId, user.id);
  } catch {
    return { error: "管理者のみがゲストメンバーを削除できます" };
  }

  // ゲストメンバー削除
  const { error: deleteError } = await guestPlayersRepo.deleteGuestPlayer({
    guestPlayerId,
    groupId,
  });

  if (deleteError) {
    console.error("Error deleting guest player:", deleteError);
    return { error: "ゲストメンバーの削除に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}
