/**
 * Group access control utilities
 * Centralizes authorization checks to eliminate code duplication
 */

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export type GroupMembership = {
  role: "admin" | "member";
  user_id: string;
  group_id: string;
  joined_at: string;
};

/**
 * Check if a user is a member of a group
 * @param groupId Group ID to check
 * @param userId User ID to check
 * @returns Membership data or null if not a member
 */
export async function checkGroupMembership(
  groupId: string,
  userId: string
): Promise<GroupMembership | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("group_members")
    .select("role, user_id, group_id, joined_at")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .single();

  return data as GroupMembership | null;
}

/**
 * Require group membership or throw 404
 * @param groupId Group ID to check
 * @param userId User ID to check
 * @returns Membership data
 * @throws 404 if user is not a member
 */
export async function requireGroupMembership(
  groupId: string,
  userId: string
): Promise<GroupMembership> {
  const membership = await checkGroupMembership(groupId, userId);

  if (!membership) {
    notFound();
  }

  return membership;
}

/**
 * Check if user is an admin of a group
 * @param groupId Group ID to check
 * @param userId User ID to check
 * @returns True if user is admin, false otherwise
 */
export async function isGroupAdmin(groupId: string, userId: string): Promise<boolean> {
  const membership = await checkGroupMembership(groupId, userId);
  return membership?.role === "admin";
}

/**
 * Require admin role or throw error
 * @param groupId Group ID to check
 * @param userId User ID to check
 * @throws Error if user is not an admin
 */
export async function requireAdminRole(groupId: string, userId: string): Promise<void> {
  const membership = await requireGroupMembership(groupId, userId);

  if (membership.role !== "admin") {
    throw new Error("管理者権限が必要です");
  }
}

/**
 * Get membership role or return null
 * @param groupId Group ID to check
 * @param userId User ID to check
 * @returns Role or null
 */
export async function getGroupRole(
  groupId: string,
  userId: string
): Promise<"admin" | "member" | null> {
  const membership = await checkGroupMembership(groupId, userId);
  return membership?.role || null;
}
