import { describe, expect, it } from "vitest";
import { canLower, canRaise, pointCost, pointsLeft, startingScores } from "./pointBuy";

describe("compra de pontos", () => {
  it("segue a tabela de custos", () => {
    expect([8, 9, 10, 11, 12, 13, 14, 15].map(pointCost)).toEqual([0, 1, 2, 3, 4, 5, 7, 9]);
  });

  it("começa com os 27 pontos inteiros", () => {
    expect(pointsLeft(startingScores(6))).toBe(27);
  });

  it("três valores 15 gastam exatamente 27 pontos", () => {
    expect(pointsLeft([15, 15, 15, 8, 8, 8])).toBe(0);
  });

  it("não deixa subir além de 15 nem gastar mais que o saldo", () => {
    expect(canRaise([15, 8], 0)).toBe(false);
    expect(canRaise([15, 15, 15, 8], 3)).toBe(false);
    expect(canRaise([14, 8], 1)).toBe(true);
  });

  it("não deixa descer abaixo de 8", () => {
    expect(canLower([8, 10], 0)).toBe(false);
    expect(canLower([8, 10], 1)).toBe(true);
  });
});
