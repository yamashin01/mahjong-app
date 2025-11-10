import { describe, it, expect } from "vitest";
import { calculatePlayerRanks, calculateUmaAndOka } from "./game-calculations";

describe("calculatePlayerRanks", () => {
  it("should calculate ranks correctly for distinct scores", () => {
    const players = [
      { playerId: "p1", finalPoints: 35000 },
      { playerId: "p2", finalPoints: 28000 },
      { playerId: "p3", finalPoints: 22000 },
      { playerId: "p4", finalPoints: 15000 },
    ];

    const { rankGroups, playerRanks } = calculatePlayerRanks(players);

    // Check rank groups
    expect(rankGroups).toHaveLength(4);
    expect(rankGroups[0]).toEqual({
      rank: 1,
      players: [{ playerId: "p1", finalPoints: 35000 }],
      points: 35000,
    });
    expect(rankGroups[3]).toEqual({
      rank: 4,
      players: [{ playerId: "p4", finalPoints: 15000 }],
      points: 15000,
    });

    // Check player ranks map
    expect(playerRanks.get("p1")).toBe(1);
    expect(playerRanks.get("p2")).toBe(2);
    expect(playerRanks.get("p3")).toBe(3);
    expect(playerRanks.get("p4")).toBe(4);
  });

  it("should handle tied scores correctly", () => {
    const players = [
      { playerId: "p1", finalPoints: 30000 },
      { playerId: "p2", finalPoints: 30000 }, // Tied for 1st
      { playerId: "p3", finalPoints: 20000 },
      { playerId: "p4", finalPoints: 20000 }, // Tied for 3rd
    ];

    const { rankGroups, playerRanks } = calculatePlayerRanks(players);

    // Check rank groups
    expect(rankGroups).toHaveLength(2);
    expect(rankGroups[0].rank).toBe(1);
    expect(rankGroups[0].players).toHaveLength(2);
    expect(rankGroups[1].rank).toBe(3);
    expect(rankGroups[1].players).toHaveLength(2);

    // Both tied players get same rank
    expect(playerRanks.get("p1")).toBe(1);
    expect(playerRanks.get("p2")).toBe(1);
    expect(playerRanks.get("p3")).toBe(3);
    expect(playerRanks.get("p4")).toBe(3);
  });

  it("should handle all players with same score", () => {
    const players = [
      { playerId: "p1", finalPoints: 25000 },
      { playerId: "p2", finalPoints: 25000 },
      { playerId: "p3", finalPoints: 25000 },
      { playerId: "p4", finalPoints: 25000 },
    ];

    const { rankGroups, playerRanks } = calculatePlayerRanks(players);

    expect(rankGroups).toHaveLength(1);
    expect(rankGroups[0].rank).toBe(1);
    expect(rankGroups[0].players).toHaveLength(4);

    // All players get rank 1
    expect(playerRanks.get("p1")).toBe(1);
    expect(playerRanks.get("p2")).toBe(1);
    expect(playerRanks.get("p3")).toBe(1);
    expect(playerRanks.get("p4")).toBe(1);
  });

  it("should handle negative scores", () => {
    const players = [
      { playerId: "p1", finalPoints: 50000 },
      { playerId: "p2", finalPoints: 25000 },
      { playerId: "p3", finalPoints: 10000 },
      { playerId: "p4", finalPoints: -5000 },
    ];

    const { playerRanks } = calculatePlayerRanks(players);

    expect(playerRanks.get("p1")).toBe(1);
    expect(playerRanks.get("p2")).toBe(2);
    expect(playerRanks.get("p3")).toBe(3);
    expect(playerRanks.get("p4")).toBe(4);
  });
});

describe("calculateUmaAndOka", () => {
  const baseRules = {
    uma_first: 20,
    uma_second: 10,
    uma_third: -10,
    uma_fourth: -20,
    oka_enabled: true,
    return_points: 30000,
    start_points: 25000,
  };

  it("should calculate uma and oka correctly for distinct ranks", () => {
    const players = [
      { playerId: "p1", finalPoints: 35000 },
      { playerId: "p2", finalPoints: 28000 },
      { playerId: "p3", finalPoints: 22000 },
      { playerId: "p4", finalPoints: 15000 },
    ];

    const { rankGroups } = calculatePlayerRanks(players);
    const umaOka = calculateUmaAndOka(rankGroups, baseRules);

    // Rank 1 should get uma_first (20) and oka (20000 = (30000-25000)*4)
    expect(umaOka.get(1)).toEqual({ uma: 20, oka: 20000 });

    // Rank 2 should get uma_second (10) and no oka
    expect(umaOka.get(2)).toEqual({ uma: 10, oka: 0 });

    // Rank 3 should get uma_third (-10) and no oka
    expect(umaOka.get(3)).toEqual({ uma: -10, oka: 0 });

    // Rank 4 should get uma_fourth (-20) and no oka
    expect(umaOka.get(4)).toEqual({ uma: -20, oka: 0 });
  });

  it("should split uma evenly when players are tied", () => {
    const players = [
      { playerId: "p1", finalPoints: 30000 },
      { playerId: "p2", finalPoints: 30000 }, // Tied for 1st
      { playerId: "p3", finalPoints: 20000 },
      { playerId: "p4", finalPoints: 15000 },
    ];

    const { rankGroups } = calculatePlayerRanks(players);
    const umaOka = calculateUmaAndOka(rankGroups, baseRules);

    // Rank 1 (2 players): split uma_first + uma_second = 20+10 = 30 / 2 = 15
    // Also split oka: 20000 / 2 = 10000
    expect(umaOka.get(1)).toEqual({ uma: 15, oka: 10000 });

    // Rank 3 should get uma_third (-10)
    expect(umaOka.get(3)).toEqual({ uma: -10, oka: 0 });

    // Rank 4 should get uma_fourth (-20)
    expect(umaOka.get(4)).toEqual({ uma: -20, oka: 0 });
  });

  it("should handle oka disabled", () => {
    const rulesNoOka = {
      ...baseRules,
      oka_enabled: false,
    };

    const players = [
      { playerId: "p1", finalPoints: 35000 },
      { playerId: "p2", finalPoints: 28000 },
      { playerId: "p3", finalPoints: 22000 },
      { playerId: "p4", finalPoints: 15000 },
    ];

    const { rankGroups } = calculatePlayerRanks(players);
    const umaOka = calculateUmaAndOka(rankGroups, rulesNoOka);

    // Rank 1 should get uma_first (20) but no oka
    expect(umaOka.get(1)).toEqual({ uma: 20, oka: 0 });
  });

  it("should split uma correctly for 3-way tie at top", () => {
    const players = [
      { playerId: "p1", finalPoints: 28000 },
      { playerId: "p2", finalPoints: 28000 },
      { playerId: "p3", finalPoints: 28000 }, // 3-way tie for 1st
      { playerId: "p4", finalPoints: 16000 },
    ];

    const { rankGroups } = calculatePlayerRanks(players);
    const umaOka = calculateUmaAndOka(rankGroups, baseRules);

    // Rank 1 (3 players): uma = (20+10+(-10)) / 3 = 20 / 3 ≈ 7 (rounded)
    // oka = 20000 / 3 ≈ 6667 (rounded)
    expect(umaOka.get(1)).toEqual({ uma: 7, oka: 6667 });

    // Rank 4 should get uma_fourth (-20)
    expect(umaOka.get(4)).toEqual({ uma: -20, oka: 0 });
  });

  it("should handle uma sum of zero correctly", () => {
    // Uma values: +20, +10, -10, -20 should sum to 0
    const players = [
      { playerId: "p1", finalPoints: 35000 },
      { playerId: "p2", finalPoints: 28000 },
      { playerId: "p3", finalPoints: 22000 },
      { playerId: "p4", finalPoints: 15000 },
    ];

    const { rankGroups } = calculatePlayerRanks(players);
    const umaOka = calculateUmaAndOka(rankGroups, baseRules);

    // Total uma should be 0
    const totalUma =
      (umaOka.get(1)?.uma ?? 0) +
      (umaOka.get(2)?.uma ?? 0) +
      (umaOka.get(3)?.uma ?? 0) +
      (umaOka.get(4)?.uma ?? 0);

    expect(totalUma).toBe(0);
  });
});
