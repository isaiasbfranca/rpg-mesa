"use client";

import { useActor } from "@/hooks/useActor";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { repository } from "@/data";
import { canCreateNpc, characterVisibility } from "@/domain/permissions";
import { valuesForTemplate } from "@/domain/sheet";
import type { Character, SessionLog } from "@/domain/types";
import { CharacterAvatar } from "@/components/avatar/CharacterAvatar";
import { useCampaign } from "./CampaignContext";

export const CampaignDashboard = () => {
  const router = useRouter();
  const { campaign } = useCampaign();
  const actor = useActor();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [lastSession, setLastSession] = useState<SessionLog>();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Character["kind"]>("pj");

  useEffect(() => {
    repository.listCharacters(campaign.id).then(setCharacters);
    repository.listSessionLogs(campaign.id).then((logs) => setLastSession(logs[0]));
  }, [campaign.id]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const character = await repository.createCharacter({
      campaignId: campaign.id,
      name: name.trim(),
      kind,
      hidden: kind === "npc",
      values: valuesForTemplate(campaign.template, {}),
    });
    router.push(`/campanhas/${campaign.id}/personagens/${character.id}`);
  };

  const visible = characters.filter((c) => characterVisibility(actor, c) !== "nenhuma");

  return (
    <div className="stack">
      {campaign.description && <p>{campaign.description}</p>}

      <section className="card stack" aria-label="Última sessão">
        <h2>Última sessão</h2>
        {lastSession ? (
          <>
            <p><strong>{lastSession.title}</strong> <span className="muted">· {new Date(lastSession.date).toLocaleDateString("pt-BR")}</span></p>
            <p style={{ whiteSpace: "pre-wrap" }}>{lastSession.summary}</p>
          </>
        ) : (
          <p className="muted">Nenhuma sessão registrada. <Link href={`/campanhas/${campaign.id}/sessoes`}>Registrar a primeira</Link></p>
        )}
      </section>

      <h2>Personagens</h2>
      {visible.length === 0 && <p className="muted">Nenhum personagem ainda.</p>}
      <div className="grid">
        {visible.map((character) => (
          <Link key={character.id} href={`/campanhas/${campaign.id}/personagens/${character.id}`} className="card row spread">
            <span className="row">
              <CharacterAvatar avatar={character.avatar} name={character.name} size={48} />
              <strong>{character.name}</strong>
            </span>
            <span className="tag">{character.kind === "npc" ? (character.hidden ? "NPC oculto" : "NPC") : "Personagem"}</span>
          </Link>
        ))}
      </div>

      <form className="card row" onSubmit={handleCreate} aria-label="Novo personagem" style={{ alignItems: "flex-end" }}>
        <label style={{ flex: "1 1 200px" }}>Nome do personagem<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        {canCreateNpc(actor, campaign) && (
          <label>
            Tipo
            <select value={kind} onChange={(e) => setKind(e.target.value === "npc" ? "npc" : "pj")}>
              <option value="pj">Personagem de jogador</option>
              <option value="npc">NPC</option>
            </select>
          </label>
        )}
        <button type="submit">Criar ficha</button>
      </form>
    </div>
  );
};
