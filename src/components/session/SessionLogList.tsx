"use client";

import { useActor } from "@/hooks/useActor";
import { useEffect, useState, type FormEvent } from "react";
import { useCampaign } from "@/components/campaign/CampaignContext";
import { repository } from "@/data";
import { canEditSessionLog, canWriteSessionLog } from "@/domain/permissions";
import type { SessionLog } from "@/domain/types";

const today = () => new Date().toISOString().slice(0, 10);

type Draft = Pick<SessionLog, "date" | "title" | "summary">;

const SessionLogEditor = ({ log, onSave, onCancel }: { log: SessionLog; onSave: (draft: Draft) => void; onCancel: () => void }) => {
  const [date, setDate] = useState(log.date);
  const [title, setTitle] = useState(log.title);
  const [summary, setSummary] = useState(log.summary);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (title.trim()) onSave({ date, title: title.trim(), summary: summary.trim() });
  };

  return (
    <form className="stack" onSubmit={handleSubmit} aria-label={`Editar sessão ${log.title}`}>
      <div className="row">
        <label>Data<input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></label>
        <label style={{ flex: "1 1 200px" }}>Título<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
      </div>
      <label>Resumo<textarea rows={5} value={summary} onChange={(e) => setSummary(e.target.value)} /></label>
      <div className="row">
        <button type="submit">Salvar alterações</button>
        <button type="button" className="secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};

export const SessionLogList = () => {
  const { campaign } = useCampaign();
  const actor = useActor();
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [date, setDate] = useState(today);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [editingId, setEditingId] = useState<string>();
  const [confirmingId, setConfirmingId] = useState<string>();

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

  const handleEdit = async (log: SessionLog, draft: Draft) => {
    await repository.updateSessionLog({ ...log, ...draft });
    setEditingId(undefined);
    refresh();
  };

  const handleDelete = async (log: SessionLog) => {
    await repository.deleteSessionLog(log.id);
    setConfirmingId(undefined);
    refresh();
  };

  const canEdit = canEditSessionLog(actor, campaign);

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
            {editingId === log.id ? (
              <SessionLogEditor log={log} onSave={(draft) => handleEdit(log, draft)} onCancel={() => setEditingId(undefined)} />
            ) : (
              <>
                <p className="muted mono">{new Date(`${log.date}T12:00:00`).toLocaleDateString("pt-BR")}</p>
                <h3>{log.title}</h3>
                {log.summary && <p style={{ whiteSpace: "pre-wrap" }}>{log.summary}</p>}
                {canEdit && (
                  <div className="row">
                    <button type="button" className="secondary" onClick={() => setEditingId(log.id)}>Editar</button>
                    {confirmingId === log.id ? (
                      <>
                        <button type="button" onClick={() => handleDelete(log)}>Confirmar exclusão</button>
                        <button type="button" className="secondary" onClick={() => setConfirmingId(undefined)}>Cancelar</button>
                      </>
                    ) : (
                      <button type="button" className="secondary" onClick={() => setConfirmingId(log.id)}>Excluir</button>
                    )}
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};
