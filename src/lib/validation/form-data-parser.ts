import type { ZodType } from "zod";

/**
 * FormData parsing utilities
 * Converts FormData to typed objects with Zod validation
 */

export type ValidationResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Safely parse FormData with a Zod schema
 */
export function parseFormData<T>(
  formData: FormData,
  schema: ZodType<T>,
  mapper: (formData: FormData) => unknown,
): ValidationResult<T> {
  try {
    const rawData = mapper(formData);
    const result = schema.safeParse(rawData);

    if (result.success) {
      return { success: true, data: result.data };
    }

    // Format Zod errors into user-friendly message
    const errorMessage = result.error.issues
      .map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      })
      .join(", ");

    return { success: false, error: errorMessage };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "データの解析に失敗しました",
    };
  }
}

/**
 * Get string value from FormData
 */
export function getStringValue(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return value ? String(value) : null;
}

/**
 * Get number value from FormData
 */
export function getNumberValue(formData: FormData, key: string): number | null {
  const value = formData.get(key);
  if (!value) return null;

  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

/**
 * Get boolean value from FormData
 */
export function getBooleanValue(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "true" || value === "on";
}

/**
 * Get integer value from FormData
 */
export function getIntValue(formData: FormData, key: string): number | null {
  const value = formData.get(key);
  if (!value) return null;

  const num = Number.parseInt(String(value), 10);
  return Number.isNaN(num) ? null : num;
}

/**
 * Parse game creation FormData
 */
export function parseGameFormData(formData: FormData) {
  const players = [];
  for (let i = 1; i <= 4; i++) {
    const playerId = getStringValue(formData, `player${i}Id`);
    const finalPoints = getIntValue(formData, `player${i}FinalPoints`);

    if (playerId && finalPoints !== null) {
      players.push({ playerId, finalPoints });
    }
  }

  return {
    groupId: getStringValue(formData, "groupId"),
    gameType: getStringValue(formData, "gameType"),
    eventId: getStringValue(formData, "eventId"),
    players,
  };
}

/**
 * Parse group creation FormData
 */
export function parseGroupFormData(formData: FormData) {
  return {
    name: getStringValue(formData, "name"),
    description: getStringValue(formData, "description") || undefined,
  };
}

/**
 * Parse event creation FormData
 */
export function parseEventFormData(formData: FormData) {
  return {
    groupId: getStringValue(formData, "groupId"),
    name: getStringValue(formData, "name"),
    description: getStringValue(formData, "description") || undefined,
    startDate: getStringValue(formData, "startDate"),
    endDate: getStringValue(formData, "endDate") || null,
  };
}

/**
 * Parse group rules FormData
 */
export function parseGroupRulesFormData(formData: FormData) {
  const startPoints = getIntValue(formData, "startPoints");
  const returnPoints = getIntValue(formData, "returnPoints");

  return {
    groupId: getStringValue(formData, "groupId"),
    gameType: getStringValue(formData, "gameType"),
    startPoints,
    returnPoints,
    okaEnabled: returnPoints !== null && startPoints !== null ? returnPoints > startPoints : false,
    rate: getNumberValue(formData, "rate"),
    umaFirst: getIntValue(formData, "umaFirst"),
    umaSecond: getIntValue(formData, "umaSecond"),
    umaThird: getIntValue(formData, "umaThird"),
    umaFourth: getIntValue(formData, "umaFourth"),
    tobiPrize: getIntValue(formData, "tobiPrize") || 0,
    yakumanPrize: getIntValue(formData, "yakumanPrize") || 0,
    yakitoriPrize: getIntValue(formData, "yakitoriPrize") || 0,
    topPrize: getIntValue(formData, "topPrize") || 0,
  };
}

/**
 * Parse join group FormData
 */
export function parseJoinGroupFormData(formData: FormData) {
  return {
    inviteCode: getStringValue(formData, "inviteCode"),
  };
}
