import { getSupabase } from "@/auth/supabaseClient";
import type { Campaign, Character, Id, Invite, Note, SessionLog } from "@/domain/types";
import type { Repository } from "./repository";

type Kind = "campaign" | "character" | "sessionLog" | "note" | "invite";
type Doc = { id: Id };

const TABLE = "mesa_docs";
const newId = () => globalThis.crypto.randomUUID();
const now = () => new Date().toISOString();
const newToken = () => Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");

const fail = (message: string): never => {
  throw new Error(`Não foi possível falar com o servidor: ${message}`);
};

const loadDocs = async <T extends Doc>(kind: Kind, campaignId?: Id): Promise<T[]> => {
  let query = getSupabase().from(TABLE).select("data").eq("kind", kind);
  if (campaignId) query = query.eq("campaign_id", campaignId);
  const { data, error } = await query;
  if (error) return fail(error.message);
  return data.map((row: { data: T }) => row.data);
};

const loadDoc = async <T extends Doc>(kind: Kind, id: Id): Promise<T | undefined> => {
  const { data, error } = await getSupabase().from(TABLE).select("data").eq("kind", kind).eq("id", id).maybeSingle();
  if (error) return fail(error.message);
  return (data as { data: T } | null)?.data;
};

const campaignIdOf = (doc: Doc, kind: Kind) => (kind === "campaign" ? doc.id : (doc as Doc & { campaignId: Id }).campaignId);

const saveDocs = async (kind: Kind, docs: Doc[]) => {
  const rows = docs.map((doc) => ({ kind, id: doc.id, campaign_id: campaignIdOf(doc, kind), data: doc, updated_at: now() }));
  const { error } = await getSupabase().from(TABLE).upsert(rows, { onConflict: "user_id,kind,id" });
  if (error) fail(error.message);
};

const save = async <T extends Doc>(kind: Kind, doc: T): Promise<T> => {
  await saveDocs(kind, [doc]);
  return doc;
};

const remove = async (kind: Kind, id: Id) => {
  const { error } = await getSupabase().from(TABLE).delete().eq("kind", kind).eq("id", id);
  if (error) fail(error.message);
};

/** Repositório da conta logada: o dono de tudo é quem criou, então é sempre a mestra. Convites para outras contas ficam para depois. */
export const createSupabaseRepository = (userId: Id): Repository => ({
  currentUserId: () => userId,

  listCampaigns: async () => (await loadDocs<Campaign>("campaign")).toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)),
  getCampaign: (id) => loadDoc<Campaign>("campaign", id),
  createCampaign: (input) => save("campaign", { ...input, id: newId(), masterId: userId, status: "ativa", createdAt: now() }),
  updateCampaign: (campaign) => save("campaign", campaign),

  listCharacters: async (campaignId) =>
    (await loadDocs<Character>("character", campaignId)).toSorted((a, b) => a.name.localeCompare(b.name, "pt-BR")),
  getCharacter: (id) => loadDoc<Character>("character", id),
  createCharacter: (input) => save("character", { ...input, id: newId(), ownerId: userId, updatedAt: now() }),
  updateCharacter: (character) => save("character", { ...character, updatedAt: now() }),
  deleteCharacter: (id) => remove("character", id),

  listSessionLogs: async (campaignId) => (await loadDocs<SessionLog>("sessionLog", campaignId)).toSorted((a, b) => b.date.localeCompare(a.date)),
  createSessionLog: (input) => save("sessionLog", { ...input, id: newId() }),

  listNotes: (campaignId) => loadDocs<Note>("note", campaignId),
  createNote: (input) => save("note", { ...input, id: newId(), authorId: userId }),
  deleteNote: (id) => remove("note", id),

  listInvites: async (campaignId) =>
    (await loadDocs<Invite>("invite", campaignId)).filter((i) => i.status !== "revogado").toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)),
  createInvite: (input) => save("invite", { ...input, id: newId(), token: newToken(), status: "pendente", createdAt: now() }),
  revokeInvite: async (id) => {
    const invite = await loadDoc<Invite>("invite", id);
    if (!invite) return;
    const revoked: Invite = { ...invite, status: "revogado" };
    await save("invite", revoked);
  },
  findInvite: async (token) => (await loadDocs<Invite>("invite")).find((i) => i.token === token),
  acceptInvite: async (token) => {
    const invite = (await loadDocs<Invite>("invite")).find((i) => i.token === token && i.status === "pendente");
    if (!invite) return undefined;
    const accepted: Invite = { ...invite, status: "aceito" };
    return save("invite", accepted);
  },
});

type LocalData = {
  campaigns: Campaign[]; characters: Character[]; sessionLogs: SessionLog[]; notes: Note[]; invites: Invite[];
};

/** Envia os dados do navegador para a conta, trocando o dono local pelo id da conta. Pode ser repetido sem duplicar (mesmos ids). */
export const importLocalData = async (userId: Id, local: LocalData) => {
  await saveDocs("campaign", local.campaigns.map((c) => ({ ...c, masterId: userId })));
  await saveDocs("character", local.characters.map((c) => ({ ...c, ownerId: userId })));
  await saveDocs("sessionLog", local.sessionLogs);
  await saveDocs("note", local.notes.map((n) => ({ ...n, authorId: userId })));
  await saveDocs("invite", local.invites);
};
