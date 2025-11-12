import * as groupsRepo from "@/lib/supabase/repositories/groups";
import type { CreateGroupInput, UpdateGroupRules } from "@/lib/validation/group-schemas";

/**
 * Group service layer
 * Business logic for group operations
 */

/**
 * Create a new group
 */
export async function createNewGroup(input: CreateGroupInput, userId: string) {
  const { data: group, error } = await groupsRepo.createGroup({
    name: input.name.trim(),
    description: input.description?.trim() || null,
    createdBy: userId,
  });

  if (error || !group) {
    throw error || new Error("グループの作成に失敗しました");
  }

  return group;
}

/**
 * Update group rules with validation
 */
export async function updateRules(groupId: string, rules: UpdateGroupRules) {
  // 返し点は開始点以上である必要がある
  if (rules.returnPoints < rules.startPoints) {
    throw new Error("返し点は開始点以上である必要があります");
  }

  const { error } = await groupsRepo.updateGroupRules({
    groupId,
    gameType: rules.gameType,
    startPoints: rules.startPoints,
    returnPoints: rules.returnPoints,
    rate: rules.rate,
    umaFirst: rules.umaFirst,
    umaSecond: rules.umaSecond,
    umaThird: rules.umaThird,
    umaFourth: rules.umaFourth,
    tobiPrize: rules.tobiPrize,
    yakumanPrize: rules.yakumanPrize,
    yakitoriPrize: rules.yakitoriPrize,
    topPrize: rules.topPrize,
  });

  if (error) {
    throw error;
  }
}

/**
 * Update group name
 */
export async function updateName(groupId: string, name: string) {
  const { error } = await groupsRepo.updateGroupName({
    groupId,
    name: name.trim(),
  });

  if (error) {
    throw error;
  }
}

/**
 * Update group description
 */
export async function updateDescription(groupId: string, description: string) {
  const { error } = await groupsRepo.updateGroupDescription({
    groupId,
    description: description.trim(),
  });

  if (error) {
    throw error;
  }
}

/**
 * Remove a member from group
 */
export async function removeMemberFromGroup(groupId: string, memberId: string) {
  const { error } = await groupsRepo.removeGroupMember({
    groupId,
    userId: memberId,
  });

  if (error) {
    throw error;
  }
}

/**
 * Update member role
 */
export async function updateRole(groupId: string, memberId: string, role: "admin" | "member") {
  const { error } = await groupsRepo.updateMemberRole({
    groupId,
    userId: memberId,
    role,
  });

  if (error) {
    throw error;
  }
}

/**
 * Delete a group
 */
export async function deleteGroupById(groupId: string) {
  const { error } = await groupsRepo.deleteGroup(groupId);

  if (error) {
    throw error;
  }
}

/**
 * Join a group by invite code
 */
export async function joinGroupByInviteCode(inviteCode: string, userId: string) {
  // グループを検索
  const { data: group, error: findError } = await groupsRepo.findGroupByInviteCode(inviteCode);

  if (findError || !group) {
    throw new Error("招待コードが無効です");
  }

  // 既存メンバーかチェック
  const { data: existingMember } = await groupsRepo.findGroupMember({
    groupId: group.id,
    userId,
  });

  if (existingMember) {
    throw new Error("既にこのグループのメンバーです");
  }

  // メンバーとして追加
  const { error: joinError } = await groupsRepo.addGroupMember({
    groupId: group.id,
    userId,
    role: "member",
  });

  if (joinError) {
    throw joinError;
  }

  return group;
}
