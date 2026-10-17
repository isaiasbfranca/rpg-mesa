"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthConfigured } from "@/auth/supabaseClient";
import { repository } from "@/data";
import { useAuthUser } from "@/hooks/useAuthUser";
import { isInviteOpen } from "@/domain/table";
import type { Campaign, Invite } from "@/domain/types";

type Found = { invite: Invite; campaign: Campaign } | null;

/** Convite recebido (2d). Rota pública com o token em ?t=, para funcionar no export estático. */
export const InviteLanding = () => {
  const router = useRouter();
  const user = useAuthUser();
  const [found, setFound] = useState<Found>();
  const [failed, setFailed] = useState(false);
  /** Sem conta, só o navegador que criou o convite o reconhece; qualquer outro precisa entrar para ver os convites da nuvem. */
  const needsLogin = isAuthConfigured && user === null && found === null;

  useEffect(() => {
    if (user === undefined) return;
    const token = new URLSearchParams(window.location.search).get("t") ?? "";
    (async () => {
      const preview = token ? await repository.previewInvite(token) : undefined;
      setFound(preview && isInviteOpen(preview.invite) ? preview : null);
    })().catch(() => setFailed(true));
  }, [user]);

  const accept = async () => {
    if (!found) return;
    try {
      await repository.acceptInvite(found.invite.token);
      router.push(`/campanhas/${found.campaign.id}`);
    } catch {
      setFailed(true);
    }
  };

  if (needsLogin) {
    const next = encodeURIComponent(`/convite/${window.location.search}`);
    return (
      <div className="parchment stack" style={{ maxWidth: 520, margin: "48px auto 0", alignItems: "stretch", gap: 14 }}>
        <p className="eyebrow" style={{ textAlign: "center" }}>Você foi convocado</p>
        <h1 style={{ fontSize: 30, textAlign: "center" }}>Entre para aceitar</h1>
        <p className="subtitle" style={{ textAlign: "center" }}>Use a sua conta para sentar à mesa. Se ainda não tem uma, crie em um minuto.</p>
        <Link href={`/entrar?next=${next}`} className="btn-gold-link" style={{ justifyContent: "center" }}>Entrar</Link>
        <Link href={`/cadastro?next=${next}`} className="muted" style={{ textAlign: "center" }}>Criar uma conta</Link>
      </div>
    );
  }
  if (failed) return <p className="error" role="alert">Não foi possível falar com o servidor. Tente de novo em instantes.</p>;
  if (found === undefined) return <p className="muted">Carregando…</p>;
  if (found === null)
    return (
      <div className="parchment stack" style={{ maxWidth: 520, margin: "40px auto" }}>
        <h1 style={{ fontSize: 30 }}>Convite indisponível</h1>
        <p className="subtitle">O link venceu, foi revogado ou pertence a outro navegador. Peça uma nova convocação à mestra.</p>
        <Link href="/campanhas">Ir para as campanhas</Link>
      </div>
    );

  const { campaign } = found;
  const tome = campaign.template.sections.length;
  return (
    <div className="parchment stack" style={{ maxWidth: 520, margin: "48px auto 0", position: "relative", alignItems: "stretch", gap: 14 }}>
      <span className="wax-seal" aria-hidden style={{ right: "auto", left: "50%", marginLeft: -34 }}>M</span>
      <p className="eyebrow" style={{ marginTop: 30, textAlign: "center" }}>Você foi convocado</p>
      <h1 style={{ fontSize: 32, textAlign: "center" }}>{campaign.name}</h1>
      <p className="subtitle" style={{ textAlign: "center", fontSize: 18 }}>A mestra chamou você para sentar à mesa.</p>
      <div className="divider"><i /></div>
      <dl className="row" style={{ margin: 0, justifyContent: "space-around" }}>
        <div><dt className="eyebrow">Sistema</dt><dd style={{ margin: 0 }}>{campaign.system}</dd></div>
        <div><dt className="eyebrow">Ficha</dt><dd style={{ margin: 0 }}>{tome} seções</dd></div>
      </dl>
      <button type="button" className="btn-lg" onClick={accept}>Aceitar e sentar à mesa</button>
      <Link href="/campanhas" className="muted" style={{ textAlign: "center" }}>Agora não</Link>
    </div>
  );
};
