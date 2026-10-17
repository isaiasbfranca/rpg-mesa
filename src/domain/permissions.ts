import type { Campaign, Character, Id, Member, Note, Role } from "./types";

/** Quem está agindo numa campanha. O servidor monta isso a partir da sessão autenticada. */
export type Actor = { userId: Id; role: Role };

/**
 * Regras de permissão da tabela 2.1 dos requisitos. Puras, para rodar no servidor
 * (autorização de verdade) e no cliente (só para esconder botões).
 */
const isMaster = (actor: Actor) => actor.role === "mestra";
const isActive = (campaign: Campaign) => campaign.status === "ativa";

export const canEditCampaign = (actor: Actor, campaign: Campaign) => isMaster(actor) && isActive(campaign);

export const canArchiveCampaign = (actor: Actor) => isMaster(actor);

export type CharacterVisibility = "completa" | "resumo" | "nenhuma";

export const characterVisibility = (actor: Actor, character: Character): CharacterVisibility => {
  if (isMaster(actor) || character.ownerId === actor.userId) return "completa";
  if (character.kind === "npc" && character.hidden) return "nenhuma";
  return "resumo";
};

export const canEditCharacter = (actor: Actor, campaign: Campaign, character: Character) =>
  isActive(campaign) && (isMaster(actor) || character.ownerId === actor.userId);

export const canCreateNpc = (actor: Actor, campaign: Campaign) => isMaster(actor) && isActive(campaign);

export const canWriteSessionLog = (actor: Actor, campaign: Campaign) => isMaster(actor) && isActive(campaign);

export const canEditSessionLog = canWriteSessionLog;

/** A mestra tira jogadores da mesa; ela mesma não sai por aqui. */
export const canRemoveMember = (actor: Actor, member: Member) => isMaster(actor) && member.role === "jogador";

export const canViewNote = (actor: Actor, note: Note) =>
  note.visibility === "campanha" || note.authorId === actor.userId;

export const canEditNote = (actor: Actor, campaign: Campaign, note: Note) =>
  isActive(campaign) && note.authorId === actor.userId;

export const canDeleteNote = (actor: Actor, campaign: Campaign, note: Note) =>
  isActive(campaign) && (note.authorId === actor.userId || (isMaster(actor) && note.visibility === "campanha"));
