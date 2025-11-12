import { describe, expect, it } from "vitest";
import {
  CreateGameInputSchema,
  GAME_LIMITS,
  PlayerInputSchema,
  UpdateGameInfoSchema,
} from "./game-schemas";

describe("PlayerInputSchema", () => {
  it("should accept valid player input", () => {
    const validInput = {
      playerId: "user-123",
      finalPoints: 35000,
    };

    const result = PlayerInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should reject empty playerId", () => {
    const invalidInput = {
      playerId: "",
      finalPoints: 25000,
    };

    const result = PlayerInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("should reject points below minimum", () => {
    const invalidInput = {
      playerId: "user-123",
      finalPoints: GAME_LIMITS.MIN_FINAL_POINTS - 1,
    };

    const result = PlayerInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("should reject points above maximum", () => {
    const invalidInput = {
      playerId: "user-123",
      finalPoints: GAME_LIMITS.MAX_FINAL_POINTS + 1,
    };

    const result = PlayerInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("should accept minimum and maximum boundary values", () => {
    const minInput = {
      playerId: "user-123",
      finalPoints: GAME_LIMITS.MIN_FINAL_POINTS,
    };

    const maxInput = {
      playerId: "user-123",
      finalPoints: GAME_LIMITS.MAX_FINAL_POINTS,
    };

    expect(PlayerInputSchema.safeParse(minInput).success).toBe(true);
    expect(PlayerInputSchema.safeParse(maxInput).success).toBe(true);
  });

  it("should reject non-integer points", () => {
    const invalidInput = {
      playerId: "user-123",
      finalPoints: 25000.5,
    };

    const result = PlayerInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

describe("CreateGameInputSchema", () => {
  it("should accept valid game creation input", () => {
    const validInput = {
      groupId: "550e8400-e29b-41d4-a716-446655440000",
      gameType: "tonpuu",
      eventId: null,
      players: [
        { playerId: "p1", finalPoints: 35000 },
        { playerId: "p2", finalPoints: 28000 },
        { playerId: "p3", finalPoints: 22000 },
        { playerId: "p4", finalPoints: 15000 },
      ],
    };

    const result = CreateGameInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should accept tonnan game type", () => {
    const validInput = {
      groupId: "550e8400-e29b-41d4-a716-446655440000",
      gameType: "tonnan",
      eventId: null,
      players: [
        { playerId: "p1", finalPoints: 35000 },
        { playerId: "p2", finalPoints: 28000 },
        { playerId: "p3", finalPoints: 22000 },
        { playerId: "p4", finalPoints: 15000 },
      ],
    };

    const result = CreateGameInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should accept valid eventId", () => {
    const validInput = {
      groupId: "550e8400-e29b-41d4-a716-446655440000",
      gameType: "tonpuu",
      eventId: "650e8400-e29b-41d4-a716-446655440001",
      players: [
        { playerId: "p1", finalPoints: 35000 },
        { playerId: "p2", finalPoints: 28000 },
        { playerId: "p3", finalPoints: 22000 },
        { playerId: "p4", finalPoints: 15000 },
      ],
    };

    const result = CreateGameInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should reject invalid groupId format", () => {
    const invalidInput = {
      groupId: "not-a-uuid",
      gameType: "tonpuu",
      eventId: null,
      players: [
        { playerId: "p1", finalPoints: 35000 },
        { playerId: "p2", finalPoints: 28000 },
        { playerId: "p3", finalPoints: 22000 },
        { playerId: "p4", finalPoints: 15000 },
      ],
    };

    const result = CreateGameInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("should reject invalid game type", () => {
    const invalidInput = {
      groupId: "550e8400-e29b-41d4-a716-446655440000",
      gameType: "invalid",
      eventId: null,
      players: [
        { playerId: "p1", finalPoints: 35000 },
        { playerId: "p2", finalPoints: 28000 },
        { playerId: "p3", finalPoints: 22000 },
        { playerId: "p4", finalPoints: 15000 },
      ],
    };

    const result = CreateGameInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("should require exactly 4 players", () => {
    const invalidInput3Players = {
      groupId: "550e8400-e29b-41d4-a716-446655440000",
      gameType: "tonpuu",
      eventId: null,
      players: [
        { playerId: "p1", finalPoints: 35000 },
        { playerId: "p2", finalPoints: 28000 },
        { playerId: "p3", finalPoints: 22000 },
      ],
    };

    const invalidInput5Players = {
      groupId: "550e8400-e29b-41d4-a716-446655440000",
      gameType: "tonpuu",
      eventId: null,
      players: [
        { playerId: "p1", finalPoints: 35000 },
        { playerId: "p2", finalPoints: 28000 },
        { playerId: "p3", finalPoints: 22000 },
        { playerId: "p4", finalPoints: 15000 },
        { playerId: "p5", finalPoints: 10000 },
      ],
    };

    expect(CreateGameInputSchema.safeParse(invalidInput3Players).success).toBe(false);
    expect(CreateGameInputSchema.safeParse(invalidInput5Players).success).toBe(false);
  });
});

describe("UpdateGameInfoSchema", () => {
  it("should accept valid game update input", () => {
    const validInput = {
      gameId: "550e8400-e29b-41d4-a716-446655440000",
      tobiPlayerId: "user-123",
      tobiGuestPlayerId: null,
      yakumanCount: 2,
    };

    const result = UpdateGameInfoSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should accept yakumanCount of 0", () => {
    const validInput = {
      gameId: "550e8400-e29b-41d4-a716-446655440000",
      tobiPlayerId: null,
      tobiGuestPlayerId: null,
      yakumanCount: 0,
    };

    const result = UpdateGameInfoSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should accept yakumanCount of 10 (max)", () => {
    const validInput = {
      gameId: "550e8400-e29b-41d4-a716-446655440000",
      tobiPlayerId: null,
      tobiGuestPlayerId: null,
      yakumanCount: 10,
    };

    const result = UpdateGameInfoSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should reject negative yakumanCount", () => {
    const invalidInput = {
      gameId: "550e8400-e29b-41d4-a716-446655440000",
      tobiPlayerId: null,
      tobiGuestPlayerId: null,
      yakumanCount: -1,
    };

    const result = UpdateGameInfoSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("should reject yakumanCount above 10", () => {
    const invalidInput = {
      gameId: "550e8400-e29b-41d4-a716-446655440000",
      tobiPlayerId: null,
      tobiGuestPlayerId: null,
      yakumanCount: 11,
    };

    const result = UpdateGameInfoSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("should reject invalid gameId format", () => {
    const invalidInput = {
      gameId: "not-a-uuid",
      tobiPlayerId: null,
      tobiGuestPlayerId: null,
      yakumanCount: 0,
    };

    const result = UpdateGameInfoSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});
