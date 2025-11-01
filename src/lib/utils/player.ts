/**
 * Utility functions for player operations
 */

import type { FlexiblePlayerData } from "@/types";

/**
 * Get display name from player data (handles both profiles and guest_players)
 * @param player Player data with either profiles or guest_players
 * @returns Display name or default fallback
 */
export function getPlayerDisplayName(player: FlexiblePlayerData | null | undefined): string {
  if (!player) return "名前未設定";
  return player.profiles?.display_name || player.guest_players?.name || "名前未設定";
}

/**
 * Parse player ID to determine if it's a guest player
 * @param playerId Player ID (can be "guest-{uuid}" format)
 * @returns Object with actualPlayerId and guestPlayerId
 */
export function parsePlayerId(playerId: string | null): {
  actualPlayerId: string | null;
  guestPlayerId: string | null;
  isGuest: boolean;
} {
  if (!playerId) {
    return { actualPlayerId: null, guestPlayerId: null, isGuest: false };
  }

  const isGuest = playerId.startsWith("guest-");

  return {
    actualPlayerId: isGuest ? null : playerId,
    guestPlayerId: isGuest ? playerId.replace("guest-", "") : null,
    isGuest,
  };
}

/**
 * Get avatar URL or null
 * @param player Player data
 * @returns Avatar URL or null
 */
export function getPlayerAvatarUrl(player: FlexiblePlayerData | null | undefined): string | null {
  return player?.profiles?.avatar_url || null;
}

/**
 * Check if player has avatar
 * @param player Player data
 * @returns Boolean indicating if player has avatar
 */
export function hasPlayerAvatar(player: FlexiblePlayerData | null | undefined): boolean {
  return !!getPlayerAvatarUrl(player);
}
