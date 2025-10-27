"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdminRole } from "@/lib/auth/group-access";

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
    return { error: "管理者のみがゲストプレイヤーを追加できます" };
  }

  // ゲストプレイヤー追加
  const { error: insertError } = await supabase.from("guest_players").insert({
    group_id: groupId,
    name: name.trim(),
  });

  if (insertError) {
    console.error("Error adding guest player:", insertError);
    return { error: "ゲストプレイヤーの追加に失敗しました" };
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
    return { error: "管理者のみがゲストプレイヤーを削除できます" };
  }

  // ゲストプレイヤー削除
  const { error: deleteError } = await supabase
    .from("guest_players")
    .delete()
    .eq("id", guestPlayerId)
    .eq("group_id", groupId);

  if (deleteError) {
    console.error("Error deleting guest player:", deleteError);
    return { error: "ゲストプレイヤーの削除に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}
