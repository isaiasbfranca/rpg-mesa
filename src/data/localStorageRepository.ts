import type { Campaign, Character, Note, SessionLog } from "@/domain/types";
import type { Repository } from "./repository";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "mesa:v1";
const LOCAL_USER_ID = "usuario-local";

type Store = { campaigns: Campaign[]; characters: Character[]; sessionLogs: SessionLog[]; notes: Note[] };

const emptyStore = (): Store => ({ campaigns: [], characters: [], sessionLogs: [], notes: [] });

const STORE_LISTS = ["campaigns", "characters", "sessionLogs", "notes"] as const;

export const isStore = (value: unknown): value is Store =>
  typeof value === "object" && value !== null && STORE_LISTS.every((list) => Array.isArray((value as Record<string, unknown>)[list]));

const read = (): Store => readJson(STORAGE_KEY, emptyStore, isStore);

const write = (store: Store) => writeJson(STORAGE_KEY, store);

const update = (change: (store: Store) => Store) => write(change(read()));

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
};
