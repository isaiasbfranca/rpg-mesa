"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { repository } from "@/data";
import { EXAMPLE_TEMPLATES } from "@/domain/templates";
import type { Campaign } from "@/domain/types";

export const CampaignList = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>();
  const [name, setName] = useState("");
  const [system, setSystem] = useState("");
  const [description, setDescription] = useState("");
  const [templateId, setTemplateId] = useState(EXAMPLE_TEMPLATES[0]?.id ?? "");

  useEffect(() => {
    repository.listCampaigns().then(setCampaigns);
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    const example = EXAMPLE_TEMPLATES.find((t) => t.id === templateId);
    if (!name.trim() || !example) return;
    const campaign = await repository.createCampaign({
      name: name.trim(),
      system: system.trim() || "Sistema próprio",
      description: description.trim(),
      modifierRule: example.modifierRule,
      defaultDie: example.defaultDie,
      template: example.template,
    });
    router.push(`/campanhas/${campaign.id}/ficha`);
  };

  return (
    <div className="stack">
      {campaigns === undefined && <p className="muted">Carregando…</p>}
      {campaigns?.length === 0 && <p className="muted">Nenhuma campanha ainda. Crie a primeira abaixo.</p>}
      <div className="grid">
        {campaigns?.map((campaign) => (
          <Link key={campaign.id} href={`/campanhas/${campaign.id}`} className="card stack" style={{ gap: 4 }}>
            <h3>{campaign.name}</h3>
            <p className="muted">{campaign.system}</p>
          </Link>
        ))}
      </div>

      <form className="card stack" onSubmit={handleCreate} aria-label="Nova campanha">
        <h2>Nova campanha</h2>
        <label>Nome<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>
          Sistema
          <input value={system} onChange={(e) => setSystem(e.target.value)} placeholder="Ex.: Tormenta adaptado" />
        </label>
        <label>Descrição<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></label>
        <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Comece com um modelo de ficha</legend>
          {EXAMPLE_TEMPLATES.map((example) => (
            <label key={example.id} className="inline card" style={{ padding: 12 }}>
              <input
                type="radio" name="template" value={example.id}
                checked={templateId === example.id} onChange={() => setTemplateId(example.id)}
              />
              <span>
                {example.name}
                <span className="help" style={{ display: "block" }}>{example.description}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <button type="submit">Criar campanha</button>
      </form>
    </div>
  );
};
