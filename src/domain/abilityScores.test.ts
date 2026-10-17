import { describe, expect, it } from "vitest";
import { abilityScoreFromDice, rollAbilityPool, rollAbilityScore } from "./abilityScores";

describe("abilityScoreFromDice", () => {
  it("descarta o menor dado e soma os três maiores", () => {
    expect(abilityScoreFromDice([1, 5, 6, 3])).toBe(14);
    expect(abilityScoreFromDice([2, 2, 2, 2])).toBe(6);
    expect(abilityScoreFromDice([6, 6, 6, 6])).toBe(18);
  });
});

describe("rollAbilityScore", () => {
  it("usa o gerador injetado quatro vezes", () => {
    const calls: number[] = [];
    const sequence = [1, 5, 6, 3];
    const score = rollAbilityScore((sides) => {
      calls.push(sides);
      return sequence[calls.length - 1] ?? 1;
    });
    expect(calls).toEqual([6, 6, 6, 6]);
    expect(score).toBe(14);
  });

  it("fica sempre entre 3 e 18 com o gerador real", () => {
    for (const value of rollAbilityPool(200)) {
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(18);
    }
  });
});

describe("rollAbilityPool", () => {
  it("devolve a quantidade pedida", () => {
    expect(rollAbilityPool(6)).toHaveLength(6);
    expect(rollAbilityPool(0)).toEqual([]);
  });
});
