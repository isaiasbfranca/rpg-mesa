import { getSupabase } from "@/auth/supabaseClient";
import { parseDice, type RollMode } from "@/domain/dice";
import { isLiveRoll, isLiveSession, toRollSpec, type LiveRoll, type LiveSession, type OnlineMember } from "@/domain/live";
import type { Id } from "@/domain/types";

/** Sessão ao vivo (US-40 e US-41): tudo passa pelo Supabase; sem conta não há sessão ao vivo. */
const fail = (message: string): never => {
  throw new Error(`Não foi possível falar com o servidor: ${message}`);
};

const toSession = (row: { id: string; campaign_id: string; started_at: string }): LiveSession => ({ id: row.id, campaignId: row.campaign_id, startedAt: row.started_at });

export const getLiveSession = async (campaignId: Id): Promise<LiveSession | undefined> => {
  const { data, error } = await getSupabase().from("mesa_live_sessions").select("id, campaign_id, started_at, ended_at").eq("campaign_id", campaignId).is("ended_at", null).maybeSingle();
  if (error) return fail(error.message);
  return isLiveSession(data) ? toSession(data) : undefined;
};

export const listLiveRolls = async (sessionId: Id): Promise<LiveRoll[]> => {
  const { data, error } = await getSupabase().from("mesa_live_rolls").select("id, roll").eq("session_id", sessionId).order("created_at", { ascending: false }).limit(100);
  if (error) return fail(error.message);
  return (data as { id: string; roll: unknown }[]).map((row) => ({ ...(row.roll as object), id: row.id })).filter(isLiveRoll);
};

export const startLiveSession = async (campaignId: Id): Promise<void> => {
  const { error } = await getSupabase().rpc("mesa_live_start", { cid: campaignId });
  if (error) fail(error.message);
};

export const endLiveSession = async (sessionId: Id): Promise<void> => {
  const { error } = await getSupabase().rpc("mesa_live_end", { sid: sessionId });
  if (error) fail(error.message);
};

export type LiveRollRequest = { expression: string; mode?: RollMode; label?: string; characterId?: string };

/** O servidor sorteia; a expressão é interpretada aqui só para checar o formato antes de enviar. */
export const rollLive = async (sessionId: Id, { expression, mode = "normal", label, characterId }: LiveRollRequest): Promise<LiveRoll> => {
  const spec = toRollSpec(parseDice(expression));
  const { data, error } = await getSupabase().rpc("mesa_live_roll", {
    sid: sessionId, spec, roll_mode: mode, expr: expression.trim(), roll_label: label ?? null, char_id: characterId ?? null,
  });
  if (error) return fail(error.message);
  if (!isLiveRoll(data)) return fail("resposta inesperada");
  return data;
};

export type LiveChannelHandlers = {
  onSessionChange: () => void;
  onRoll: (roll: LiveRoll) => void;
  onOnline: (members: OnlineMember[]) => void;
  /** `true` ao conectar (inclusive ao reconectar), `false` quando a conexão cai. */
  onConnection: (connected: boolean) => void;
};

const isOnlineMember = (value: unknown): value is OnlineMember =>
  typeof value === "object" && value !== null && "userId" in value && typeof value.userId === "string" && "name" in value && typeof value.name === "string";

/** Abre o canal da campanha. `setPresence` mostra (ou esconde) a pessoa na lista de online. */
export const openLiveChannel = (campaignId: Id, handlers: LiveChannelHandlers) => {
  const supabase = getSupabase();
  const channel = supabase.channel(`mesa-ao-vivo:${campaignId}`, { config: { presence: { key: globalThis.crypto.randomUUID() } } });
  const filter = `campaign_id=eq.${campaignId}`;

  channel
    .on("postgres_changes", { event: "*", schema: "public", table: "mesa_live_sessions", filter }, () => handlers.onSessionChange())
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "mesa_live_rolls", filter }, (payload) => {
      const row: unknown = payload.new;
      if (typeof row !== "object" || row === null || !("id" in row) || !("roll" in row)) return;
      const roll: unknown = { ...(row.roll as object), id: row.id };
      if (isLiveRoll(roll)) handlers.onRoll(roll);
    })
    .on("presence", { event: "sync" }, () => {
      const entries: unknown[] = Object.values(channel.presenceState()).flat();
      handlers.onOnline(entries.filter(isOnlineMember));
    })
    .subscribe((status) => handlers.onConnection(status === "SUBSCRIBED"));

  return {
    setPresence: (member: OnlineMember | undefined) => (member ? channel.track(member) : channel.untrack()),
    close: () => supabase.removeChannel(channel),
  };
};

/** A pessoa logada e o nome que ela deu à conta; `undefined` sem login (aí não há sessão ao vivo). */
export const getLiveIdentity = async (): Promise<OnlineMember | undefined> => {
  const { data } = await getSupabase().auth.getUser();
  const user = data.user;
  if (!user) return undefined;
  const meta: unknown = user.user_metadata?.display_name;
  return { userId: user.id, name: typeof meta === "string" && meta.trim() ? meta.trim() : "Jogador" };
};
