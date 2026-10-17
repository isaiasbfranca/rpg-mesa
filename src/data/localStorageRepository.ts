import type { Campaign, Character, Invite, Note, SessionLog } from "@/domain/types";
import type { Repository } from "./repository";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "mesa:v1";
const LOCAL_USER_ID = "usuario-local";

/** `invites` é opcional: dados salvos antes do E2 não têm a lista. */
type Store = { campaigns: Campaign[]; characters: Character[]; sessionLogs: SessionLog[]; notes: Note[]; invites?: Invite[] };

const emptyStore = (): Store => ({ campaigns: [], characters: [], sessionLogs: [], notes: [] });

const STORE_LISTS = ["campaigns", "characters", "sessionLogs", "notes"] as const;

export const isStore = (value: unknown): value is Store =>
  typeof value === "object" && value !== null && STORE_LISTS.every((list) => Array.isArray((value as Record<string, unknown>)[list]));

const read = (): Store => readJson(STORAGE_KEY, emptyStore, isStore);

const write = (store: Store) => writeJson(STORAGE_KEY, store);

const update = (change: (store: Store) => Store) => write(change(read()));

const newToken = () => {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};
const invitesOf = (s: Store) => s.invites ?? [];
const newId = () => globalThis.crypto.randomUUID();
const now = () => new Date().toISOString();

const replaceById = <T extends { id: string }>(items: T[], item: T) => items.map((i) => (i.id === item.id ? item : i));

export const localStorageRepository: Repository = {
  currentUserId: () => LOCAL_USER_ID,

  listCampaigns: async () => read().campaigns.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)),

  getCampaign: async (id) => read().campaigns.find((c) => c.id === id),

  createCampaign: async (input) => {
    const campaign: Campaign = { ...input, id: newId(), masterId: LOCAL_USER_ID, status: "ativa", createdAt: now() };
    update((s) => ({ ...s, campaigns: [...s.campaigns, campaign] }));
    return campaign;
  },

  updateCampaign: async (campaign) => {
    update((s) => ({ ...s, campaigns: replaceById(s.campaigns, campaign) }));
    return campaign;
  },

  listCharacters: async (campaignId) =>
    read()
      .characters.filter((c) => c.campaignId === campaignId)
      .toSorted((a, b) => a.name.localeCompare(b.name, "pt-BR")),

  getCharacter: async (id) => read().characters.find((c) => c.id === id),

  createCharacter: async (input) => {
    const character: Character = { ...input, id: newId(), ownerId: LOCAL_USER_ID, updatedAt: now() };
    update((s) => ({ ...s, characters: [...s.characters, character] }));
    return character;
  },

  updateCharacter: async (character) => {
    const saved = { ...character, updatedAt: now() };
    update((s) => ({ ...s, characters: replaceById(s.characters, saved) }));
    return saved;
  },

  deleteCharacter: async (id) => update((s) => ({ ...s, characters: s.characters.filter((c) => c.id !== id) })),

  listSessionLogs: async (campaignId) =>
    read()
      .sessionLogs.filter((l) => l.campaignId === campaignId)
      .toSorted((a, b) => b.date.localeCompare(a.date)),

  createSessionLog: async (input) => {
    const log: SessionLog = { ...input, id: newId() };
    update((s) => ({ ...s, sessionLogs: [...s.sessionLogs, log] }));
    return log;
  },

  listNotes: async (campaignId) => read().notes.filter((n) => n.campaignId === campaignId),

  createNote: async (input) => {
    const note: Note = { ...input, id: newId(), authorId: LOCAL_USER_ID };
    update((s) => ({ ...s, notes: [...s.notes, note] }));
    return note;
  },

  deleteNote: async (id) => update((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) })),

  listInvites: async (campaignId) =>
    invitesOf(read())
      .filter((i) => i.campaignId === campaignId && i.status !== "revogado")
      .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)),

  createInvite: async (input) => {
    const invite: Invite = { ...input, id: newId(), token: newToken(), status: "pendente", createdAt: now() };
    update((s) => ({ ...s, invites: [...invitesOf(s), invite] }));
    return invite;
  },

  revokeInvite: async (id) =>
    update((s) => ({ ...s, invites: invitesOf(s).map((i) => (i.id === id ? { ...i, status: "revogado" as const } : i)) })),

  findInvite: async (token) => invitesOf(read()).find((i) => i.token === token),

  previewInvite: async (token) => {
    const store = read();
    const invite = invitesOf(store).find((i) => i.token === token);
    const campaign = invite && store.campaigns.find((c) => c.id === invite.campaignId);
    return invite && campaign ? { invite, campaign } : undefined;
  },

  acceptInvite: async (token) => {
    const found = invitesOf(read()).find((i) => i.token === token && i.status === "pendente");
    if (!found) return undefined;
    const accepted: Invite = { ...found, status: "aceito" };
    update((s) => ({ ...s, invites: invitesOf(s).map((i) => (i.id === found.id ? accepted : i)) }));
    return accepted;
  },
};

/** Tudo o que há salvo neste navegador, para enviar à conta. */
export const readLocalData = () => {
  const store = read();
  return { ...store, invites: invitesOf(store) };
};

export const hasLocalData = () => read().campaigns.length > 0;
