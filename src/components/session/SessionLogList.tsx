"use client";

import { useActor } from "@/hooks/useActor";
import { useEffect, useState, type FormEvent } from "react";
import { useCampaign } from "@/components/campaign/CampaignContext";
import { repository } from "@/data";
import { canWriteSessionLog } from "@/domain/permissions";
import type { SessionLog } from "@/domain/types";

const today = () => new Date().toISOString().slice(0, 10);

export const SessionLogList = () => {
  const { campaign } = useCampaign();
  const actor = useActor();
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [date, setDate] = useState(today);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const refresh = () => repository.listSessionLogs(campaign.id).then(setLogs);

  useEffect(() => {
    repository.listSessionLogs(campaign.id).then(setLogs);
  }, [campaign.id]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    await repository.createSessionLog({ campaignId: campaign.id, date, title: title.trim(), summary: summary.trim() });
    setTitle("");
    setSummary("");
    refresh();
  };

  return (
    <div className="stack">
      {canWriteSessionLog(actor, campaign) && (
        <form className="card stack" onSubmit={handleSubmit} aria-label="Registrar sessão">
          <h2>Registrar sessão</h2>
          <div className="row">
            <label>Data<input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></label>
            <label style={{ flex: "1 1 200px" }}>Título<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
          </div>
          <label>Resumo<textarea rows={5} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="O que aconteceu, decisões do grupo, ganchos…" /></label>
          <button type="submit">Salvar registro</button>
        </form>
      )}

      <h2>Linha do tempo</h2>
      {logs.length === 0 && <p className="muted">Nenhuma sessão registrada ainda.</p>}
      <ol className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {logs.map((log) => (
          <li key={log.id} className="card stack" style={{ gap: 4 }}>
            <p className="muted mono">{new Date(`${log.date}T12:00:00`).toLocaleDateString("pt-BR")}</p>
            <h3>{log.title}</h3>
            {log.summary && <p style={{ whiteSpace: "pre-wrap" }}>{log.summary}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
};
