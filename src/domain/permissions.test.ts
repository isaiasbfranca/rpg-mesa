import { describe, expect, it } from "vitest";
import {
  canArchiveCampaign,
  canCreateNpc,
  canDeleteNote,
  canRemoveParticipant,
  canEditNote,
  canEditCampaign,
  canEditCharacter,
  canViewNote,
  canWriteSessionLog,
  characterVisibility,
  type Actor,
} from "./permissions";
import type { Campaign, Character, Note } from "./types";

const master: Actor = { userId: "m", role: "mestra" };
const owner: Actor = { userId: "j1", role: "jogador" };
const other: Actor = { userId: "j2", role: "jogador" };

const campaign = { status: "ativa" } as Campaign;
const archived = { status: "arquivada" } as Campaign;
const pc = { ownerId: "j1", kind: "pj", hidden: false } as Character;
const hiddenNpc = { ownerId: "m", kind: "npc", hidden: true } as Character;
const revealedNpc = { ownerId: "m", kind: "npc", hidden: false } as Character;
const privateNote = { authorId: "j1", visibility: "privada" } as Note;
const sharedNote = { authorId: "j1", visibility: "campanha" } as Note;

describe("campanha", () => {
  it("só a mestra edita, e nunca arquivada", () => {
    expect(canEditCampaign(master, campaign)).toBe(true);
    expect(canEditCampaign(owner, campaign)).toBe(false);
    expect(canEditCampaign(master, archived)).toBe(false);
  });

  it("só a mestra arquiva e cria NPC", () => {
    expect(canArchiveCampaign(master)).toBe(true);
    expect(canArchiveCampaign(owner)).toBe(false);
    expect(canCreateNpc(master, campaign)).toBe(true);
    expect(canCreateNpc(owner, campaign)).toBe(false);
    expect(canCreateNpc(master, archived)).toBe(false);
  });

  it("só a mestra escreve registro de sessão", () => {
    expect(canWriteSessionLog(master, campaign)).toBe(true);
    expect(canWriteSessionLog(owner, campaign)).toBe(false);
  });
});

describe("personagens", () => {
  it("ficha completa para mestra e dono, resumo para os outros", () => {
    expect(characterVisibility(master, pc)).toBe("completa");
    expect(characterVisibility(owner, pc)).toBe("completa");
    expect(characterVisibility(other, pc)).toBe("resumo");
  });

  it("NPC oculto não aparece para jogadores", () => {
    expect(characterVisibility(other, hiddenNpc)).toBe("nenhuma");
    expect(characterVisibility(other, revealedNpc)).toBe("resumo");
    expect(characterVisibility(master, hiddenNpc)).toBe("completa");
  });

  it("edição só por mestra ou dono, em campanha ativa", () => {
    expect(canEditCharacter(master, campaign, pc)).toBe(true);
    expect(canEditCharacter(owner, campaign, pc)).toBe(true);
    expect(canEditCharacter(other, campaign, pc)).toBe(false);
    expect(canEditCharacter(owner, archived, pc)).toBe(false);
  });
});

describe("notas", () => {
  it("nota privada só para o autor, inclusive diante da mestra", () => {
    expect(canViewNote(owner, privateNote)).toBe(true);
    expect(canViewNote(master, privateNote)).toBe(false);
    expect(canViewNote(other, sharedNote)).toBe(true);
  });

  it("só o autor edita a própria nota, nunca em campanha arquivada", () => {
    expect(canEditNote(owner, campaign, sharedNote)).toBe(true);
    expect(canEditNote(master, campaign, sharedNote)).toBe(false);
    expect(canEditNote(owner, archived, sharedNote)).toBe(false);
  });

  it("mestra exclui nota de campanha alheia, jogador não", () => {
    expect(canDeleteNote(master, campaign, sharedNote)).toBe(true);
    expect(canDeleteNote(master, campaign, privateNote)).toBe(false);
    expect(canDeleteNote(other, campaign, sharedNote)).toBe(false);
    expect(canDeleteNote(owner, archived, sharedNote)).toBe(false);
  });
});

describe("participantes", () => {
  const player = { campaignId: campaign.id, userId: owner.userId, role: "jogador" as const };
  const masterSeat = { campaignId: campaign.id, userId: master.userId, role: "mestra" as const };

  it("mestra remove jogador, mas não a si mesma", () => {
    expect(canRemoveParticipant(master, campaign, player)).toBe(true);
    expect(canRemoveParticipant(master, campaign, masterSeat)).toBe(false);
  });

  it("jogador não remove ninguém e campanha arquivada não muda", () => {
    expect(canRemoveParticipant(other, campaign, player)).toBe(false);
    expect(canRemoveParticipant(master, archived, player)).toBe(false);
  });
});
