"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { repository } from "@/data";
import { isInviteOpen } from "@/domain/table";
import type { Campaign, Invite } from "@/domain/types";

type Found = { invite: Invite; campaign: Campaign } | null;

/** Convite recebido (2d). Rota pública com o token em ?t=, para funcionar no export estático. */
export const InviteLanding = () => {
  const router = useRouter();
  const [found, setFound] = useState<Found>();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("t") ?? "";
    (async () => {
      const invite = token ? await repository.findInvite(token) : undefined;
      const campaign = invite ? await repository.getCampaign(invite.campaignId) : undefined;
      setFound(invite && campaign && isInviteOpen(invite) ? { invite, campaign } : null);
    })();
  }, []);

  const accept = async () => {
    if (!found) return;
    await repository.acceptInvite(found.invite.token);
    router.push(`/campanhas/${found.campaign.id}`);
  };

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
