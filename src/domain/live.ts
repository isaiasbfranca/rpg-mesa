import type { DiceExpression, DiceRoll } from "./dice";

export type LiveSession = { id: string; campaignId: string; startedAt: string };

/** Rolagem sorteada no servidor; `id` e `authorName` vêm de lá. */
export type LiveRoll = DiceRoll & { id: string; authorName: string };

export type OnlineMember = { userId: string; name: string };

/** O que o servidor recebe: só os dados da expressão. O sorteio e o total são dele. */
export const toRollSpec = ({ dice, modifier }: DiceExpression) => ({ dice, modifier });

/** Junta uma rolagem nova à lista (mais recente primeiro) sem repetir a que já chegou pelo canal ao vivo. */
export const mergeLiveRoll = (rolls: LiveRoll[], incoming: LiveRoll): LiveRoll[] => {
  if (rolls.some((roll) => roll.id === incoming.id)) return rolls;
  return [incoming, ...rolls].toSorted((a, b) => b.rolledAt.localeCompare(a.rolledAt));
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export const isLiveRoll = (value: unknown): value is LiveRoll =>
  isRecord(value) && typeof value.id === "string" && typeof value.total === "number" && Array.isArray(value.attempts) && typeof value.rolledAt === "string";

export const isLiveSession = (value: unknown): value is { id: string; campaign_id: string; started_at: string; ended_at: string | null } =>
  isRecord(value) && typeof value.id === "string" && typeof value.campaign_id === "string" && typeof value.started_at === "string";

/** Quem está online, sem repetir a mesma pessoa em duas abas, em ordem alfabética. */
export const uniqueOnline = (members: OnlineMember[]): OnlineMember[] =>
  [...new Map(members.map((member) => [member.userId, member])).values()].toSorted((a, b) => a.name.localeCompare(b.name, "pt-BR"));
