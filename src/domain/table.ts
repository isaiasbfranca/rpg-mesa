import type { Invite } from "./types";

export const INVITE_VALID_DAYS = 7;
export const MIN_SEATS = 1;
export const MAX_SEATS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Posição das cadeiras em círculo, a primeira no topo e as outras no sentido horário. */
export const seatPositions = (count: number, radius: number): { x: number; y: number }[] =>
  Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
    return { x: Math.round(Math.cos(angle) * radius * 100) / 100, y: Math.round(Math.sin(angle) * radius * 100) / 100 };
  });

export const clampSeats = (value: number): number => Math.min(MAX_SEATS, Math.max(MIN_SEATS, Math.round(value) || MIN_SEATS));

/** Convite vale por 7 dias a partir da criação, e só enquanto estiver pendente. */
export const isInviteOpen = (invite: Invite, now: Date = new Date()): boolean =>
  invite.status === "pendente" && now.getTime() - new Date(invite.createdAt).getTime() < INVITE_VALID_DAYS * DAY_MS;

export const daysSince = (iso: string, now: Date = new Date()): number =>
  Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / DAY_MS));
