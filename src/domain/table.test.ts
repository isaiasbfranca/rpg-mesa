import { describe, expect, it } from "vitest";
import { clampSeats, daysSince, isInviteOpen, seatPositions } from "./table";
import type { Invite } from "./types";

const invite = (overrides: Partial<Invite> = {}): Invite => ({
  id: "i", campaignId: "c", token: "t", status: "pendente", createdAt: "2026-10-10T00:00:00.000Z", ...overrides,
});

describe("seatPositions", () => {
  it("põe a primeira cadeira no topo e distribui as demais em círculo", () => {
    const [top, right, bottom, left] = seatPositions(4, 100);
    expect(top).toEqual({ x: 0, y: -100 });
    expect(right).toEqual({ x: 100, y: 0 });
    expect(bottom).toEqual({ x: 0, y: 100 });
    expect(left).toEqual({ x: -100, y: 0 });
  });
});

describe("clampSeats", () => {
  it("limita entre 1 e 7 cadeiras", () => {
    expect(clampSeats(0)).toBe(1);
    expect(clampSeats(12)).toBe(7);
    expect(clampSeats(4.4)).toBe(4);
    expect(clampSeats(Number.NaN)).toBe(1);
  });
});

describe("isInviteOpen", () => {
  it("vale por 7 dias", () => {
    expect(isInviteOpen(invite(), new Date("2026-10-16T00:00:00.000Z"))).toBe(true);
    expect(isInviteOpen(invite(), new Date("2026-10-17T00:00:00.000Z"))).toBe(false);
  });
  it("não vale se aceito ou revogado", () => {
    const now = new Date("2026-10-11T00:00:00.000Z");
    expect(isInviteOpen(invite({ status: "aceito" }), now)).toBe(false);
    expect(isInviteOpen(invite({ status: "revogado" }), now)).toBe(false);
  });
});

describe("daysSince", () => {
  it("conta dias inteiros", () => {
    expect(daysSince("2026-10-10T00:00:00.000Z", new Date("2026-10-13T12:00:00.000Z"))).toBe(3);
  });
});
