import { getSupabase } from "@/auth/supabaseClient";
import type { Campaign, Character, Id, Invite, Member, Note, SessionLog } from "@/domain/types";
import type { InvitePreview, Repository } from "./repository";

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

const rowOf = (kind: Kind, doc: Doc) => ({ kind, id: doc.id, campaign_id: campaignIdOf(doc, kind), data: doc, updated_at: now() });

/** Cria documentos do próprio usuário (ou regrava os seus, na importação). */
const saveDocs = async (kind: Kind, docs: Doc[]) => {
  const { error } = await getSupabase().from(TABLE).upsert(docs.map((doc) => rowOf(kind, doc)), { onConflict: "user_id,kind,id" });
  if (error) fail(error.message);
};

const create = async <T extends Doc>(kind: Kind, doc: T): Promise<T> => {
  const { error } = await getSupabase().from(TABLE).insert(rowOf(kind, doc));
  if (error) fail(error.message);
  return doc;
};

/** Atualiza pelo id sem trocar o dono: a mestra edita fichas de jogadores, que continuam sendo deles. */
const change = async <T extends Doc>(kind: Kind, doc: T): Promise<T> => {
  const { data, error } = await getSupabase().from(TABLE).update({ data: doc, updated_at: now() }).eq("kind", kind).eq("id", doc.id).select("id");
  if (error) fail(error.message);
  if (!data?.length) fail("sem permissão para alterar este item");
  return doc;
};

const remove = async (kind: Kind, id: Id) => {
  const { error } = await getSupabase().from(TABLE).delete().eq("kind", kind).eq("id", id);
  if (error) fail(error.message);
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const isInvite = (value: unknown): value is Invite => isRecord(value) && typeof value.token === "string" && typeof value.campaignId === "string";
const isCampaign = (value: unknown): value is Campaign => isRecord(value) && typeof value.id === "string" && typeof value.name === "string";

const previewInvite = async (token: string): Promise<InvitePreview | undefined> => {
  const { data, error } = await getSupabase().rpc("mesa_invite_preview", { invite_token: token });
  if (error) return fail(error.message);
  return isRecord(data) && isInvite(data.invite) && isCampaign(data.campaign) ? { invite: data.invite, campaign: data.campaign } : undefined;
};

type MemberRow = { campaign_id: Id; user_id: Id; role: Member["role"]; display_name: string | null };

const listMembers = async (campaignId: Id): Promise<Member[]> => {
  const { data, error } = await getSupabase().from("mesa_members").select("campaign_id, user_id, role, display_name").eq("campaign_id", campaignId).order("joined_at");
  if (error) return fail(error.message);
  return (data as MemberRow[]).map((row) => ({ campaignId: row.campaign_id, userId: row.user_id, role: row.role, displayName: row.display_name ?? undefined }));
};

const removeMember = async (campaignId: Id, userId: Id) => {
  const { data, error } = await getSupabase().from("mesa_members").delete().eq("campaign_id", campaignId).eq("user_id", userId).eq("role", "jogador").select("user_id");
  if (error) fail(error.message);
  if (!data?.length) fail("sem permissão para remover este participante");
};

const addMaster = async (campaignIds: Id[], userId: Id) => {
  const rows = campaignIds.map((campaign_id) => ({ campaign_id, user_id: userId, role: "mestra" }));
  const { error } = await getSupabase().from("mesa_members").upsert(rows, { onConflict: "campaign_id,user_id", ignoreDuplicates: true });
  if (error) fail(error.message);
};

/** A mestra é a primeira participante; sem esse vínculo ela não enxergaria nem os convites que cria. */
const createCampaign = async (userId: Id, campaign: Campaign): Promise<Campaign> => {
  await create("campaign", campaign);
  await addMaster([campaign.id], userId);
  return campaign;
};

/** Repositório da conta logada. Quem cria a campanha é a mestra; jogadores entram por convite e as regras de acesso ficam no banco (supabase/schema.sql). */
export const createSupabaseRepository = (userId: Id): Repository => ({
  currentUserId: () => userId,

  listCampaigns: async () => (await loadDocs<Campaign>("campaign")).toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)),
  getCampaign: (id) => loadDoc<Campaign>("campaign", id),
  createCampaign: (input) => createCampaign(userId, { ...input, id: newId(), masterId: userId, status: "ativa", createdAt: now() }),
  updateCampaign: (campaign) => change("campaign", campaign),

  listCharacters: async (campaignId) =>
    (await loadDocs<Character>("character", campaignId)).toSorted((a, b) => a.name.localeCompare(b.name, "pt-BR")),
  getCharacter: (id) => loadDoc<Character>("character", id),
  createCharacter: (input) => create("character", { ...input, id: newId(), ownerId: userId, updatedAt: now() }),
  updateCharacter: (character) => change("character", { ...character, updatedAt: now() }),
  deleteCharacter: (id) => remove("character", id),

  listSessionLogs: async (campaignId) => (await loadDocs<SessionLog>("sessionLog", campaignId)).toSorted((a, b) => b.date.localeCompare(a.date)),
  createSessionLog: (input) => create("sessionLog", { ...input, id: newId() }),

  updateSessionLog: (log) => change("sessionLog", log),
  deleteSessionLog: (id) => remove("sessionLog", id),

  listNotes: (campaignId) => loadDocs<Note>("note", campaignId),
  createNote: (input) => create("note", { ...input, id: newId(), authorId: userId }),
  deleteNote: (id) => remove("note", id),

  listMembers,
  removeMember,

  listInvites: async (campaignId) =>
    (await loadDocs<Invite>("invite", campaignId)).filter((i) => i.status !== "revogado").toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)),
  createInvite: (input) => create("invite", { ...input, id: newId(), token: newToken(), status: "pendente", createdAt: now() }),
  revokeInvite: async (id) => {
    const invite = await loadDoc<Invite>("invite", id);
    if (!invite) return;
    const revoked: Invite = { ...invite, status: "revogado" };
    await change("invite", revoked);
  },
  findInvite: async (token) => (await previewInvite(token))?.invite,
  previewInvite,
  acceptInvite: async (token) => {
    const { data, error } = await getSupabase().rpc("mesa_accept_invite", { invite_token: token });
    if (error) return fail(error.message);
    return isInvite(data) ? data : undefined;
  },
});

type LocalData = {
  campaigns: Campaign[]; characters: Character[]; sessionLogs: SessionLog[]; notes: Note[]; invites: Invite[];
};

/** Envia os dados do navegador para a conta, trocando o dono local pelo id da conta. Pode ser repetido sem duplicar (mesmos ids). */
export const importLocalData = async (userId: Id, local: LocalData) => {
  await saveDocs("campaign", local.campaigns.map((c) => ({ ...c, masterId: userId })));
  await addMaster(local.campaigns.map((c) => c.id), userId);
  await saveDocs("character", local.characters.map((c) => ({ ...c, ownerId: userId })));
  await saveDocs("sessionLog", local.sessionLogs);
  await saveDocs("note", local.notes.map((n) => ({ ...n, authorId: userId })));
  await saveDocs("invite", local.invites);
};
