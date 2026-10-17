import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Sem URL e chave públicas o app segue sem login, só com os dados do navegador. */
export const isAuthConfigured = Boolean(url && anonKey);

let client: SupabaseClient | undefined;

export const getSupabase = (): SupabaseClient => {
  if (!url || !anonKey) throw new Error("Autenticação não configurada.");
  client ??= createClient(url, anonKey);
  return client;
};
