"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (groupError) {
    console.error("Error creating group:", groupError);
    return { error: "グループの作成に失敗しました" };
  }

  // トリガーによってgroup_membersとgroup_rulesが自動作成される

  revalidatePath("/groups");
  redirect(`/groups/${group.id}`);
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
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id")
    .eq("invite_code", inviteCode.trim().toUpperCase())
    .single();

  if (groupError || !group) {
    return { error: "招待コードが無効です" };
  }

  // すでにメンバーかチェック
  const { data: existingMember } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", group.id)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    return { error: "すでにこのグループに参加しています" };
  }

  // グループに参加
  const { error: joinError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "member",
  });

  if (joinError) {
    console.error("Error joining group:", joinError);
    return { error: "グループへの参加に失敗しました" };
  }

  revalidatePath("/groups");
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
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (!membership || membership.role !== "admin") {
    return { error: "管理者権限がありません" };
  }

  // 自分自身は削除できない
  if (userId === user.id) {
    return { error: "自分自身を削除することはできません" };
  }

  // メンバーを削除
  const { error: removeError } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

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
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (!membership || membership.role !== "admin") {
    return { error: "管理者権限がありません" };
  }

  // 自分自身のロールは変更できない
  if (userId === user.id) {
    return { error: "自分自身のロールは変更できません" };
  }

  // ロールを更新
  const { error: updateError } = await supabase
    .from("group_members")
    .update({ role: newRole })
    .eq("group_id", groupId)
    .eq("user_id", userId);

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
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (!membership || membership.role !== "admin") {
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

  // バリデーション
  if (startPoints <= 0 || returnPoints <= 0 || rate <= 0) {
    return { error: "正しい数値を入力してください" };
  }

  // ルールを更新
  const { error: updateError } = await supabase
    .from("group_rules")
    .update({
      game_type: gameType,
      start_points: startPoints,
      return_points: returnPoints,
      rate: rate,
      uma_first: umaFirst,
      uma_second: umaSecond,
      uma_third: umaThird,
      uma_fourth: umaFourth,
    })
    .eq("group_id", groupId);

  if (updateError) {
    console.error("Error updating rules:", updateError);
    return { error: "ルールの更新に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}`);
}
