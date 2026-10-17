import { friendlyAuthError } from "@/domain/authValidation";
import { getSupabase } from "./supabaseClient";

export type AuthUser = { id: string; email: string };
export type AuthResult = { error: string | null };

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const pageUrl = (path: string) => `${window.location.origin}${basePath}${path}`;

const toResult = (error: { message: string } | null): AuthResult => ({ error: error ? friendlyAuthError(error.message) : null });

export const signIn = async (email: string, password: string): Promise<AuthResult> =>
  toResult((await getSupabase().auth.signInWithPassword({ email: email.trim(), password })).error);

/** `needsConfirmation` é verdadeiro quando o serviço exige confirmar o e-mail antes do primeiro acesso. */
export const signUp = async (
  email: string, password: string, displayName: string,
): Promise<AuthResult & { needsConfirmation: boolean }> => {
  const { data, error } = await getSupabase().auth.signUp({
    email: email.trim(), password,
    options: { data: { display_name: displayName.trim() }, emailRedirectTo: pageUrl("/campanhas/") },
  });
  return { ...toResult(error), needsConfirmation: !error && !data.session };
};

export const requestPasswordReset = async (email: string): Promise<AuthResult> =>
  toResult((await getSupabase().auth.resetPasswordForEmail(email.trim(), { redirectTo: pageUrl("/redefinir/") })).error);

export const updatePassword = async (password: string): Promise<AuthResult> =>
  toResult((await getSupabase().auth.updateUser({ password })).error);

export const signOut = async (): Promise<void> => {
  await getSupabase().auth.signOut();
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data } = await getSupabase().auth.getSession();
  const user = data.session?.user;
  return user?.email ? { id: user.id, email: user.email } : null;
};

type AuthEvent = "SIGNED_OUT" | "PASSWORD_RECOVERY" | "OTHER";

/** Notifica mudanças de sessão; devolve a função que cancela a assinatura. */
export const onAuthChange = (listener: (user: AuthUser | null, event: AuthEvent) => void): (() => void) => {
  const { data } = getSupabase().auth.onAuthStateChange((event, session) => {
    const user = session?.user.email ? { id: session.user.id, email: session.user.email } : null;
    listener(user, event === "SIGNED_OUT" || event === "PASSWORD_RECOVERY" ? event : "OTHER");
  });
  return () => data.subscription.unsubscribe();
};
