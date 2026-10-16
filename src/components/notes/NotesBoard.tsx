"use client";

import { useActor } from "@/hooks/useActor";
import { useEffect, useState, type FormEvent } from "react";
import { useCampaign } from "@/components/campaign/CampaignContext";
import { repository } from "@/data";
import { canDeleteNote, canViewNote } from "@/domain/permissions";
import type { Note, NoteCategory } from "@/domain/types";

const CATEGORY_LABELS: Record<NoteCategory, string> = { npc: "NPC", local: "Local", item: "Item", outro: "Outro" };

export const NotesBoard = () => {
  const { campaign } = useCampaign();
  const actor = useActor();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<NoteCategory | "">("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<Note["visibility"]>("privada");
  const [category, setCategory] = useState<NoteCategory | "">("");

  const refresh = () => repository.listNotes(campaign.id).then(setNotes);

  useEffect(() => {
    repository.listNotes(campaign.id).then(setNotes);
  }, [campaign.id]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    await repository.createNote({
      campaignId: campaign.id,
      title: title.trim(),
      body: body.trim(),
      visibility,
      category: category || undefined,
    });
    setTitle("");
    setBody("");
    refresh();
  };

  const remove = async (note: Note) => {
    if (!window.confirm(`Excluir a nota "${note.title}"?`)) return;
    await repository.deleteNote(note.id);
    refresh();
  };

  const query = search.trim().toLocaleLowerCase("pt-BR");
  const shown = notes
    .filter((n) => canViewNote(actor, n))
    .filter((n) => !filter || n.category === filter)
    .filter((n) => !query || n.title.toLocaleLowerCase("pt-BR").includes(query));

  return (
    <div className="stack">
      <form className="card stack" onSubmit={handleSubmit} aria-label="Nova nota">
        <h2>Nova nota</h2>
        <label>Título<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>Texto<textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} /></label>
        <div className="row">
          <label>
            Visibilidade
            <select value={visibility} onChange={(e) => setVisibility(e.target.value === "campanha" ? "campanha" : "privada")}>
              <option value="privada">Só eu</option>
              <option value="campanha">Toda a campanha</option>
            </select>
          </label>
          <label>
            Categoria
            <select value={category} onChange={(e) => setCategory(e.target.value as NoteCategory | "")}>
              <option value="">Sem categoria</option>
              {Object.entries(CATEGORY_LABELS).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
        </div>
        <button type="submit">Salvar nota</button>
      </form>

      <div className="row">
        <label style={{ flex: "1 1 200px" }}>Buscar por título<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
        <label>
          Filtrar
          <select value={filter} onChange={(e) => setFilter(e.target.value as NoteCategory | "")}>
            <option value="">Todas</option>
            {Object.entries(CATEGORY_LABELS).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
          </select>
        </label>
      </div>

      {shown.length === 0 && <p className="muted">Nenhuma nota encontrada.</p>}
      <div className="grid">
        {shown.map((note) => (
          <article key={note.id} className="card stack">
            <div className="row spread">
              <h3>{note.title}</h3>
              <span className="row">
                {note.category && <span className="tag">{CATEGORY_LABELS[note.category]}</span>}
                <span className="tag">{note.visibility === "privada" ? "Privada" : "Campanha"}</span>
              </span>
            </div>
            {note.body && <p style={{ whiteSpace: "pre-wrap" }}>{note.body}</p>}
            {canDeleteNote(actor, campaign, note) && (
              <button type="button" className="danger" onClick={() => remove(note)} style={{ alignSelf: "flex-start" }}>Excluir</button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};
