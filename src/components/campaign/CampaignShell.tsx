"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { repository } from "@/data";
import { useRealPath, useRouteId } from "@/hooks/useRouteId";
import type { Campaign } from "@/domain/types";
import { CampaignContext } from "./CampaignContext";

const TABS = [
  { path: "", label: "Painel" },
  { path: "/tavola", label: "Távola" },
  { path: "/ficha", label: "Modelo de ficha" },
  { path: "/sessoes", label: "Sessões" },
  { path: "/notas", label: "Notas" },
  { path: "/dados", label: "Dados" },
];

/** No celular a barra inferior leva ao essencial; a ficha do personagem fica no Painel. */
const BOTTOM_TABS = [
  { path: "", label: "Painel" },
  { path: "/ficha", label: "Ficha" },
  { path: "/dados", label: "Dados" },
  { path: "/tavola", label: "Távola" },
];

export const CampaignShell = ({ campaignId: routeId, children }: { campaignId: string; children: React.ReactNode }) => {
  const pathname = useRealPath();
  const campaignId = useRouteId(routeId, "campanhas");
  const [campaign, setCampaign] = useState<Campaign | null>();

  useEffect(() => {
    if (!campaignId) return;
    repository.getCampaign(campaignId).then((found) => setCampaign(found ?? null));
  }, [campaignId]);

  const saveCampaign = useCallback(async (next: Campaign) => {
    setCampaign(await repository.updateCampaign(next));
  }, []);

  const contextValue = useMemo(() => (campaign ? { campaign, saveCampaign } : null), [campaign, saveCampaign]);

  if (!campaignId || campaign === undefined) return <p className="muted">Carregando…</p>;
  if (campaign === null || !contextValue)
    return <p>Campanha não encontrada. <Link href="/campanhas">Voltar para campanhas</Link></p>;

  const base = `/campanhas/${campaign.id}`;
  return (
    <CampaignContext.Provider value={contextValue}>
      <header className="banner">
        <span className="crest" aria-hidden>{campaign.name.trim().charAt(0).toLocaleUpperCase("pt-BR")}</span>
        <div className="stack" style={{ gap: 2 }}>
          <Link href="/campanhas" className="eyebrow back-link" style={{ textDecoration: "none" }}>‹ Campanhas</Link>
          <h1>{campaign.name}</h1>
          <p className="eyebrow">{campaign.system}{campaign.status === "arquivada" && " · arquivada"}</p>
        </div>
      </header>
      <nav className="tabs" aria-label="Seções da campanha">
        {TABS.map((tab) => (
          <Link key={tab.path} href={base + tab.path} aria-current={pathname === base + tab.path ? "page" : undefined}>
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
      <nav className="bottom-nav" aria-label="Atalhos da campanha">
        {BOTTOM_TABS.map((tab) => (
          <Link key={tab.path} href={base + tab.path} aria-current={pathname === base + tab.path ? "page" : undefined}>
            {tab.label}
          </Link>
        ))}
      </nav>
    </CampaignContext.Provider>
  );
};
