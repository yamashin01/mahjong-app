"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/auth/group-access";
import { createNewGroup, joinGroupByInviteCode, updateRules } from "@/lib/services/group-service";
import * as groupsRepo from "@/lib/supabase/repositories/groups";
import { createClient } from "@/lib/supabase/server";
import {
  getStringValue,
  parseFormData,
  parseGroupFormData,
  parseGroupRulesFormData,
  parseJoinGroupFormData,
} from "@/lib/validation/form-data-parser";
import {
  CreateGroupInputSchema,
  JoinGroupInputSchema,
  UpdateGroupRulesSchema,
} from "@/lib/validation/group-schemas";

export async function createGroup(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // FormDataをパースしてバリデーション
  const parseResult = parseFormData(formData, CreateGroupInputSchema, parseGroupFormData);

  if (!parseResult.success) {
    return { error: parseResult.error };
  }

  const input = parseResult.data;

  // グループを作成
  let group: { id: string };
  try {
    group = await createNewGroup(input, user.id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "グループの作成に失敗しました",
    };
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

  // FormDataをパースしてバリデーション
  const parseResult = parseFormData(formData, JoinGroupInputSchema, parseJoinGroupFormData);

  if (!parseResult.success) {
    return { error: parseResult.error };
  }

  const input = parseResult.data;

  // グループに参加
  let group: { id: string };
  try {
    group = await joinGroupByInviteCode(input.inviteCode.toUpperCase(), user.id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "グループへの参加に失敗しました",
    };
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

  const groupId = getStringValue(formData, "groupId");

  if (!groupId) {
    return { error: "グループIDが不正です" };
  }

  // 管理者権限チェック
  try {
    await requireAdminRole(groupId, user.id);
  } catch {
    return { error: "管理者権限がありません" };
  }

  // FormDataをパースしてバリデーション
  const parseResult = parseFormData(formData, UpdateGroupRulesSchema, parseGroupRulesFormData);

  if (!parseResult.success) {
    return { error: parseResult.error };
  }

  const input = parseResult.data;

  // ルールを更新
  try {
    await updateRules(input.groupId, input);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "ルールの更新に失敗しました",
    };
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
