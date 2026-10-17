"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { onAuthChange, requestPasswordReset, signIn, signUp, updatePassword } from "@/auth/authService";
import { isAuthConfigured } from "@/auth/supabaseClient";
import {
  validateEmail, validatePassword, validatePasswordConfirmation,
} from "@/domain/authValidation";
import { AuthCard } from "./AuthCard";

type Outcome = { error: string | null };

/** Cuida do envio: valida, trava o botão e mostra o erro; só a ação muda entre os formulários. */
const useSubmit = (run: () => string | null | Promise<string | null>) => {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(await run());
    setBusy(false);
  };
  return { error, busy, submit };
};

const Fail = ({ error }: { error: string | null }) =>
  error ? <p className="error" role="alert">{error}</p> : null;

const firstError = (...checks: Array<string | null>) => checks.find(Boolean) ?? null;
const fromOutcome = ({ error }: Outcome) => error;

export const SignInForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, busy, submit } = useSubmit(async () => {
    const invalid = firstError(validateEmail(email), password ? null : "Informe a senha.");
    if (invalid) return invalid;
    const result = fromOutcome(await signIn(email, password));
    if (!result) router.push("/campanhas");
    return result;
  });
  return (
    <AuthCard eyebrow="Bem-vinda de volta" title="Entrar" subtitle="Sente-se à mesa.">
      <form className="stack" onSubmit={submit} noValidate>
        <label>E-mail<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <Fail error={error} />
        <button type="submit" className="btn-lg" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
        <Link href="/recuperar" className="muted" style={{ textAlign: "center" }}>Esqueci a senha</Link>
        <Link href="/cadastro" className="muted" style={{ textAlign: "center" }}>Criar uma conta</Link>
      </form>
    </AuthCard>
  );
};

export const SignUpForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [sent, setSent] = useState(false);
  const router = useRouter();
  const { error, busy, submit } = useSubmit(async () => {
    const invalid = firstError(
      name.trim() ? null : "Informe como quer ser chamada.",
      validateEmail(email), validatePassword(password), validatePasswordConfirmation(password, confirmation),
    );
    if (invalid) return invalid;
    const result = await signUp(email, password, name);
    if (result.error) return result.error;
    if (result.needsConfirmation) setSent(true);
    else router.push("/campanhas");
    return null;
  });

  if (sent)
    return (
      <AuthCard eyebrow="Quase lá" title="Confirme seu e-mail" subtitle={`Enviamos um link para ${email.trim()}.`}>
        <p className="subtitle" style={{ textAlign: "center" }}>Abra a mensagem e toque no link para ativar a conta. Depois é só entrar.</p>
        <Link href="/entrar" className="btn-gold-link" style={{ justifyContent: "center" }}>Ir para o login</Link>
      </AuthCard>
    );
  return (
    <AuthCard eyebrow="Nova conta" title="Criar conta" subtitle="Leve suas campanhas para qualquer lugar.">
      <form className="stack" onSubmit={submit} noValidate>
        <label>Nome<input autoComplete="nickname" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>E-mail<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Senha<input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <label>Repita a senha<input type="password" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></label>
        <Fail error={error} />
        <button type="submit" className="btn-lg" disabled={busy}>{busy ? "Criando…" : "Criar conta"}</button>
        <Link href="/entrar" className="muted" style={{ textAlign: "center" }}>Já tenho conta</Link>
      </form>
    </AuthCard>
  );
};

export const RecoverForm = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { error, busy, submit } = useSubmit(async () => {
    const invalid = validateEmail(email);
    if (invalid) return invalid;
    const result = fromOutcome(await requestPasswordReset(email));
    if (!result) setSent(true);
    return result;
  });

  if (sent)
    return (
      <AuthCard eyebrow="Enviado" title="Veja seu e-mail" subtitle="Se houver uma conta com esse endereço, o link de redefinição já está a caminho.">
        <Link href="/entrar" className="btn-gold-link" style={{ justifyContent: "center" }}>Voltar ao login</Link>
      </AuthCard>
    );
  return (
    <AuthCard eyebrow="Recuperar conta" title="Esqueci a senha" subtitle="Enviaremos um link para criar uma nova.">
      <form className="stack" onSubmit={submit} noValidate>
        <label>E-mail<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <Fail error={error} />
        <button type="submit" className="btn-lg" disabled={busy}>{busy ? "Enviando…" : "Enviar link"}</button>
        <Link href="/entrar" className="muted" style={{ textAlign: "center" }}>Voltar ao login</Link>
      </form>
    </AuthCard>
  );
};

/** Aberta pelo link do e-mail: o serviço cria uma sessão de recuperação e só então a senha pode ser trocada. */
export const ResetPasswordForm = () => {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const { error, busy, submit } = useSubmit(async () => {
    const invalid = firstError(validatePassword(password), validatePasswordConfirmation(password, confirmation));
    if (invalid) return invalid;
    const result = fromOutcome(await updatePassword(password));
    if (!result) router.push("/campanhas");
    return result;
  });

  useEffect(() => {
    if (!isAuthConfigured) return;
    return onAuthChange((_user, event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
  }, []);

  return (
    <AuthCard eyebrow="Recuperar conta" title="Nova senha">
      {ready ? (
        <form className="stack" onSubmit={submit} noValidate>
          <label>Nova senha<input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <label>Repita a senha<input type="password" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></label>
          <Fail error={error} />
          <button type="submit" className="btn-lg" disabled={busy}>{busy ? "Salvando…" : "Salvar nova senha"}</button>
        </form>
      ) : (
        <>
          <p className="subtitle" style={{ textAlign: "center" }}>Abra esta página pelo link que enviamos ao seu e-mail. Se o link venceu, peça outro.</p>
          <Link href="/recuperar" className="btn-gold-link" style={{ justifyContent: "center" }}>Pedir novo link</Link>
        </>
      )}
    </AuthCard>
  );
};
