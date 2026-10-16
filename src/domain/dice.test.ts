import { describe, expect, it } from "vitest";
import { attributeRollExpression, cryptoRandom, DiceParseError, naturalResult, parseDice, rollDice } from "./dice";

const max = (sides: number) => sides;
const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length] ?? 1;
};

describe("parseDice", () => {
  it("interpreta dado simples", () => {
    expect(parseDice("d20")).toEqual({ dice: [{ count: 1, sides: 20, sign: 1 }], modifier: 0 });
  });

  it("interpreta múltiplos termos, espaços e sinal tipográfico", () => {
    expect(parseDice("2d6 + 1d4 − 1 + 3")).toEqual({
      dice: [
        { count: 2, sides: 6, sign: 1 },
        { count: 1, sides: 4, sign: 1 },
      ],
      modifier: 2,
    });
  });

  it("aceita os limites de RF-12", () => {
    expect(() => parseDice("100d1000")).not.toThrow();
    expect(() => parseDice("1d2")).not.toThrow();
  });

  it("DEF-01: espaço entre termos sem operador é erro, não junta os números", () => {
    expect(() => parseDice("1d20 5")).toThrow(/Falta \+ ou −/);
    expect(() => parseDice("2d6 3d4")).toThrow(DiceParseError);
    expect(parseDice(" 1d20 + 5 ")).toEqual({ dice: [{ count: 1, sides: 20, sign: 1 }], modifier: 5 });
  });

  it("CT-DAD-04 / DEF-05: limites de RF-12 v0.2.1", () => {
    expect(() => parseDice("60d6+40d4")).not.toThrow();
    expect(() => parseDice("1d20+1000")).not.toThrow();
    expect(() => parseDice("60d6+50d4")).toThrow(/no máximo 100 dados/);
    expect(() => parseDice("1d20+1001")).toThrow(/0 a 1000/);
    expect(() => parseDice("1d20+99999999999999999999")).toThrow(/0 a 1000/);
    expect(() => parseDice(["1d6", ...Array(9).fill("1")].join("+"))).not.toThrow();
    expect(() => parseDice(["1d6", ...Array(10).fill("1")].join("+"))).toThrow(/10 termos/);
    expect(() => parseDice(Array(11).fill("1d4").join("+"))).toThrow(/10 termos/); // DEF-07
    expect(() => parseDice(`1d20${"+1".repeat(49)}`)).toThrow(/100 caracteres/); // DEF-07
    expect(() => parseDice(`1d20+${" ".repeat(95)}1`)).toThrow(/100 caracteres/);
    expect(() => parseDice(`1d20+${" ".repeat(94)}1`)).not.toThrow();
  });

  it.each(["d", "0d6", "1d6++2", "1d6+", "1d6d6", "3"])("CT-DAD-05: rejeita %j", (input) => {
    expect(() => parseDice(input)).toThrow(DiceParseError);
  });

  it("CT-DAD-07: aceita maiúsculas e sinal tipográfico", () => {
    expect(parseDice("2D6 + 1").modifier).toBe(1);
    expect(parseDice("1d20−2").modifier).toBe(-2);
  });

  it.each(["", "abc", "2d", "d1", "101d6", "1d1001", "5", "2d6++", "2d6 3d4", "d20+x"])("rejeita %j", (input) => {
    expect(() => parseDice(input)).toThrow(DiceParseError);
  });
});

describe("rollDice", () => {
  it("soma dados e modificador", () => {
    const result = rollDice("2d6+3", { random: max });
    expect(result.total).toBe(15);
    expect(result.attempts[0]?.rolls[0]?.values).toEqual([6, 6]);
  });

  it("subtrai dados negativos", () => {
    expect(rollDice("1d8-1d4", { random: max }).total).toBe(4);
  });

  it("vantagem fica com o maior total", () => {
    const result = rollDice("1d20+2", { mode: "vantagem", random: sequence(5, 17) });
    expect(result.attempts.map((a) => a.total)).toEqual([7, 19]);
    expect(result.total).toBe(19);
  });

  it("desvantagem fica com o menor total", () => {
    expect(rollDice("1d20", { mode: "desvantagem", random: sequence(5, 17) }).total).toBe(5);
  });
});

describe("cryptoRandom", () => {
  it.each([2, 6, 20, 100, 1000])("fica em [1, %i]", (sides) => {
    for (let i = 0; i < 2000; i++) {
      const value = cryptoRandom(sides);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(sides);
    }
  });

  it("distribui o d6 de forma aproximadamente uniforme", () => {
    const counts = new Array<number>(6).fill(0);
    const rolls = 60_000;
    for (let i = 0; i < rolls; i++) counts[cryptoRandom(6) - 1]!++;
    const expected = rolls / 6;
    const chiSquare = counts.reduce((sum, c) => sum + (c - expected) ** 2 / expected, 0);
    expect(chiSquare).toBeLessThan(20.5); // p ≈ 0,001 com 5 graus de liberdade
  });
});

describe("auxiliares", () => {
  it("monta expressão de rolagem por atributo", () => {
    expect(attributeRollExpression(20, 3)).toBe("1d20+3");
    expect(attributeRollExpression(20, -1)).toBe("1d20-1");
    expect(attributeRollExpression(6, 0)).toBe("1d6");
  });

  it("detecta 20 e 1 naturais só em um d20 único", () => {
    expect(naturalResult(rollDice("1d20+5", { random: max }).attempts[0]!)).toBe("critico");
    expect(naturalResult(rollDice("1d20", { random: () => 1 }).attempts[0]!)).toBe("falha");
    expect(naturalResult(rollDice("2d20", { random: max }).attempts[0]!)).toBeUndefined();
  });
});
