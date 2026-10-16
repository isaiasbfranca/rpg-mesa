"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { repository } from "@/data";
import type { Campaign } from "@/domain/types";
import { CampaignContext } from "./CampaignContext";

const TABS = [
  { path: "", label: "Painel" },
  { path: "/ficha", label: "Modelo de ficha" },
  { path: "/sessoes", label: "Sessões" },
  { path: "/notas", label: "Notas" },
  { path: "/dados", label: "Dados" },
];

export const CampaignShell = ({ campaignId, children }: { campaignId: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const [campaign, setCampaign] = useState<Campaign | null>();

  useEffect(() => {
    repository.getCampaign(campaignId).then((found) => setCampaign(found ?? null));
  }, [campaignId]);

  const saveCampaign = useCallback(async (next: Campaign) => {
    setCampaign(await repository.updateCampaign(next));
  }, []);

  const contextValue = useMemo(() => (campaign ? { campaign, saveCampaign } : null), [campaign, saveCampaign]);

  if (campaign === undefined) return <p className="muted">Carregando…</p>;
  if (campaign === null || !contextValue)
    return <p>Campanha não encontrada. <Link href="/campanhas">Voltar para campanhas</Link></p>;

  const base = `/campanhas/${campaign.id}`;
  return (
    <CampaignContext.Provider value={contextValue}>
      <header className="stack" style={{ gap: 4, marginBottom: 12 }}>
        <Link href="/campanhas" className="muted back-link">← Campanhas</Link>
        <h1>{campaign.name}</h1>
        <p className="muted">{campaign.system}{campaign.status === "arquivada" && " · arquivada"}</p>
      </header>
      <nav className="tabs" aria-label="Seções da campanha">
        {TABS.map((tab) => (
          <Link key={tab.path} href={base + tab.path} aria-current={pathname === base + tab.path ? "page" : undefined}>
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </CampaignContext.Provider>
  );
};
