"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/auth/group-access";
import * as groupsRepo from "@/lib/supabase/repositories/groups";
import { createClient } from "@/lib/supabase/server";

export async function createGroup(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name || name.trim() === "") {
    return { error: "グループ名を入力してください" };
  }

  // グループを作成
  const { data: group, error: groupError } = await groupsRepo.createGroup({
    name: name.trim(),
    description: description?.trim() || null,
    createdBy: user.id,
  });

  if (groupError) {
    console.error("Error creating group:", groupError);
    return { error: "グループの作成に失敗しました" };
  }

  // トリガーによってgroup_membersとgroup_rulesが自動作成される

  revalidatePath("/");
  redirect(`/groups/${group.id}/settings`);
}

export async function joinGroup(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const inviteCode = formData.get("inviteCode") as string;

  if (!inviteCode || inviteCode.trim() === "") {
    return { error: "招待コードを入力してください" };
  }

  // 招待コードでグループを検索
  const { data: group, error: groupError } = await groupsRepo.findGroupByInviteCode(
    inviteCode.trim().toUpperCase(),
  );

  if (groupError || !group) {
    return { error: "招待コードが無効です" };
  }

  // すでにメンバーかチェック
  const { data: existingMember } = await groupsRepo.findGroupMember({
    groupId: group.id,
    userId: user.id,
  });

  if (existingMember) {
    return { error: "すでにこのグループに参加しています" };
  }

  // グループに参加
  const { error: joinError } = await groupsRepo.addGroupMember({
    groupId: group.id,
    userId: user.id,
    role: "member",
  });

  if (joinError) {
    console.error("Error joining group:", joinError);
    return { error: "グループへの参加に失敗しました" };
  }

  revalidatePath("/");
  redirect(`/groups/${group.id}`);
}

export async function removeMember(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const groupId = formData.get("groupId") as string;
  const userId = formData.get("userId") as string;

  // 管理者権限チェック
  try {
    await requireAdminRole(groupId, user.id);
  } catch {
    return { error: "管理者権限がありません" };
  }

  // 自分自身は削除できない
  if (userId === user.id) {
    return { error: "自分自身を削除することはできません" };
  }

  // メンバーを削除
  const { error: removeError } = await groupsRepo.removeGroupMember({
    groupId,
    userId,
  });

  if (removeError) {
    console.error("Error removing member:", removeError);
    return { error: "メンバーの削除に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}

export async function updateMemberRole(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const groupId = formData.get("groupId") as string;
  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as "admin" | "member";

  // 管理者権限チェック
  try {
    await requireAdminRole(groupId, user.id);
  } catch {
    return { error: "管理者権限がありません" };
  }

  // 自分自身のロールは変更できない
  if (userId === user.id) {
    return { error: "自分自身のロールは変更できません" };
  }

  // ロールを更新
  const { error: updateError } = await groupsRepo.updateMemberRole({
    groupId,
    userId,
    role: newRole,
  });

  if (updateError) {
    console.error("Error updating role:", updateError);
    return { error: "ロールの更新に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}

export async function updateGroupRules(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const groupId = formData.get("groupId") as string;

  // 管理者権限チェック
  try {
    await requireAdminRole(groupId, user.id);
  } catch {
    return { error: "管理者権限がありません" };
  }

  // フォームデータから値を取得
  const gameType = formData.get("gameType") as "tonpuu" | "tonnan";
  const startPoints = Number.parseInt(formData.get("startPoints") as string, 10);
  const returnPoints = Number.parseInt(formData.get("returnPoints") as string, 10);
  const rate = Number.parseFloat(formData.get("rate") as string);
  const umaFirst = Number.parseInt(formData.get("umaFirst") as string, 10);
  const umaSecond = Number.parseInt(formData.get("umaSecond") as string, 10);
  const umaThird = Number.parseInt(formData.get("umaThird") as string, 10);
  const umaFourth = Number.parseInt(formData.get("umaFourth") as string, 10);
  const tobiPrize = formData.get("tobiPrize")
    ? Number.parseInt(formData.get("tobiPrize") as string, 10)
    : null;
  const yakumanPrize = formData.get("yakumanPrize")
    ? Number.parseInt(formData.get("yakumanPrize") as string, 10)
    : null;
  const yakitoriPrize = formData.get("yakitoriPrize")
    ? Number.parseInt(formData.get("yakitoriPrize") as string, 10)
    : null;

  // バリデーション
  if (startPoints <= 0 || returnPoints <= 0 || rate <= 0) {
    return { error: "正しい数値を入力してください" };
  }

  // 返し点は開始点以上である必要がある
  if (returnPoints < startPoints) {
    return { error: "返し点は開始点以上である必要があります" };
  }

  // ルールを更新
  const { error: updateError } = await groupsRepo.updateGroupRules({
    groupId,
    gameType,
    startPoints,
    returnPoints,
    rate,
    umaFirst,
    umaSecond,
    umaThird,
    umaFourth,
    tobiPrize,
    yakumanPrize,
    yakitoriPrize,
  });

  if (updateError) {
    console.error("Error updating rules:", updateError);
    return { error: "ルールの更新に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}`);
}

export async function updateGroupName(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const groupId = formData.get("groupId") as string;
  const name = formData.get("name") as string;

  // 管理者権限チェック
  try {
    await requireAdminRole(groupId, user.id);
  } catch {
    return { error: "管理者権限がありません" };
  }

  // バリデーション
  if (!name || name.trim() === "") {
    return { error: "グループ名を入力してください" };
  }

  if (name.trim().length > 100) {
    return { error: "グループ名は100文字以内で入力してください" };
  }

  // グループ名を更新
  const { error: updateError } = await groupsRepo.updateGroupName({
    groupId,
    name: name.trim(),
  });

  if (updateError) {
    console.error("Error updating group name:", updateError);
    return { error: "グループ名の更新に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}

export async function deleteGroup(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const groupId = formData.get("groupId") as string;

  // 管理者権限チェック
  try {
    await requireAdminRole(groupId, user.id);
  } catch {
    return { error: "管理者権限がありません" };
  }

  // グループを削除（関連するイベント、対局、メンバーなども CASCADE で削除される）
  const { error } = await groupsRepo.deleteGroup(groupId);

  if (error) {
    console.error("Error deleting group:", error);
    return { error: "グループの削除に失敗しました" };
  }

  revalidatePath("/groups");
  redirect("/groups");
}

export async function updateGroupDescription(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const groupId = formData.get("groupId") as string;
  const description = formData.get("description") as string;

  // 管理者権限チェック
  try {
    await requireAdminRole(groupId, user.id);
  } catch {
    return { error: "管理者権限がありません" };
  }

  // バリデーション
  if (description.trim().length > 500) {
    return { error: "説明は500文字以内で入力してください" };
  }

  // グループ説明を更新
  const { error: updateError } = await groupsRepo.updateGroupDescription({
    groupId,
    description: description.trim(),
  });

  if (updateError) {
    console.error("Error updating group description:", updateError);
    return { error: "グループ説明の更新に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}
