import { describe, expect, it } from "vitest";
import { parseDice } from "./dice";
import { isLiveRoll, mergeLiveRoll, toRollSpec, uniqueOnline, type LiveRoll } from "./live";

const roll = (id: string, rolledAt: string): LiveRoll => ({ id, authorName: "Bia", expression: "d20", mode: "normal", attempts: [], total: 10, rolledAt });

describe("sessão ao vivo", () => {
  it("manda ao servidor só dados e modificador", () => {
    expect(toRollSpec(parseDice("2d6+3"))).toEqual({ dice: [{ count: 2, sides: 6, sign: 1 }], modifier: 3 });
  });

  it("não repete a rolagem que chega pelo canal e pela resposta", () => {
    const first = roll("a", "2026-10-17T10:00:00.000Z");
    expect(mergeLiveRoll([first], first)).toHaveLength(1);
  });

  it("mantém a mais recente primeiro", () => {
    const merged = mergeLiveRoll([roll("a", "2026-10-17T10:00:00.000Z")], roll("b", "2026-10-17T10:00:05.000Z"));
    expect(merged.map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("reconhece rolagem válida e recusa lixo", () => {
    expect(isLiveRoll(roll("a", "2026-10-17T10:00:00.000Z"))).toBe(true);
    expect(isLiveRoll({ total: "x" })).toBe(false);
    expect(isLiveRoll(null)).toBe(false);
  });

  it("lista cada pessoa online uma vez, em ordem alfabética", () => {
    const online = uniqueOnline([{ userId: "2", name: "Bia" }, { userId: "1", name: "Ana" }, { userId: "2", name: "Bia" }]);
    expect(online.map((m) => m.name)).toEqual(["Ana", "Bia"]);
  });
});
