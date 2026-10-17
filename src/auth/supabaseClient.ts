import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** URL do projeto e chave "anon" são públicas por desenho (a segurança vem das regras do banco); variáveis de ambiente têm prioridade. */
const DEFAULT_URL = "https://cxudhkslilazggnudhwc.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dWRoa3NsaWxhemdnbnVkaHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxODA0NzQsImV4cCI6MjEwNzc1NjQ3NH0.IHCEXosrK_QgWKv5sWcD6DthUsfR6yJtI5OSyIMLdBI";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

/** Se a URL ou a chave forem esvaziadas, o app segue sem login, só com os dados do navegador. */
export const isAuthConfigured = Boolean(url && anonKey);

let client: SupabaseClient | undefined;

export const getSupabase = (): SupabaseClient => {
  if (!url || !anonKey) throw new Error("Autenticação não configurada.");
  client ??= createClient(url, anonKey);
  return client;
};
