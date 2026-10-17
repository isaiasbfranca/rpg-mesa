"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { repository } from "@/data";
import { EXAMPLE_TEMPLATES, type ExampleTemplate } from "@/domain/templates";
import { clampSeats, MAX_SEATS, MIN_SEATS } from "@/domain/table";
import type { Campaign } from "@/domain/types";
import { RoundTable, type SeatInfo } from "./RoundTable";

const TOME_COLORS: Record<string, string> = { "classico-d20": "#2c4a3a", "dnd5e-srd": "#4a2c5a", narrativo: "#5a2420", "em-branco": "#3d3226" };
const TOME_DICE: Record<string, string> = { "classico-d20": "1d20 + mod", "dnd5e-srd": "1d20 + mod", narrativo: "1d6 + valor", "em-branco": "você decide" };
const STEP_LABELS = ["Nome", "Tomo", "Cadeiras"];

const seatsAround = (players: number): SeatInfo[] => [
  { kind: "master", initials: "M", name: "Mestra" },
  ...Array.from({ length: players }, (_, i): SeatInfo => ({ kind: "empty", initials: "+", name: `Vaga ${i + 1}` })),
];

const TemplatePreview = ({ example }: { example: ExampleTemplate }) => (
  <section className="card stack" aria-label={`Pré-visualização de ${example.name}`} style={{ gap: 8 }}>
    <h3>Como fica a ficha</h3>
    <ul className="stack" style={{ gap: 4, listStyle: "none", padding: 0, margin: 0 }}>
      {example.template.sections.map((section) => (
        <li key={section.id}>
          <strong>{section.title}</strong>
          <span className="muted"> · {section.fields.map((field) => field.label).join(", ")}</span>
        </li>
      ))}
    </ul>
    {example.source && (
      <p className="help">
        Fonte: <a href={example.source.url} target="_blank" rel="noreferrer">{example.source.name}</a>. Licença: {example.source.license}. A campanha criada é independente deste modelo.
      </p>
    )}
  </section>
);

export const CampaignList = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>();
  const [name, setName] = useState("");
  const [system, setSystem] = useState("");
  const [schedule, setSchedule] = useState("");
  const [description, setDescription] = useState("");
  const [templateId, setTemplateId] = useState(EXAMPLE_TEMPLATES[0]?.id ?? "");
  const [seats, setSeats] = useState(4);
  /** Só o celular usa o passo: no desktop as três partes aparecem juntas. */
  const [step, setStep] = useState(1);

  useEffect(() => {
    repository.listCampaigns().then(setCampaigns);
  }, []);

  const create = async (next: "ficha" | "tavola") => {
    const example = EXAMPLE_TEMPLATES.find((t) => t.id === templateId);
    if (!name.trim() || !example) return;
    const campaign = await repository.createCampaign({
      name: name.trim(),
      system: system.trim() || "Sistema próprio",
      description: description.trim(),
      schedule: schedule.trim() || undefined,
      seats,
      modifierRule: example.modifierRule,
      defaultDie: example.defaultDie,
      template: example.template,
    });
    router.push(`/campanhas/${campaign.id}/${next}`);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (step < 3) setStep(step + 1);
    else create("tavola");
  };

  const selectedExample = EXAMPLE_TEMPLATES.find((t) => t.id === templateId);

  const section = (n: number) => `fund-section ${step === n ? "is-current" : ""}`;

  return (
    <div className="stack" style={{ gap: 28 }}>
      <header className="stack" style={{ gap: 6 }}>
        <p className="eyebrow">Suas mesas</p>
        <h1>Campanhas</h1>
      </header>
      {campaigns === undefined && <p className="muted">Carregando…</p>}
      {campaigns?.length === 0 && <p className="muted subtitle">Nenhuma campanha ainda. Funde a primeira abaixo.</p>}
      <div className="grid">
        {campaigns?.map((campaign) => (
          <Link key={campaign.id} href={`/campanhas/${campaign.id}`} className="card stack" style={{ gap: 4 }}>
            <h3>{campaign.name}</h3>
            <p className="eyebrow">{campaign.system}{campaign.status === "arquivada" && " · arquivada"}</p>
          </Link>
        ))}
      </div>

      <form className="stack" onSubmit={handleSubmit} aria-label="Nova campanha" style={{ gap: 20, paddingBottom: 72 }}>
        <header className="stack" style={{ gap: 6 }}>
          <p className="eyebrow">Nova campanha</p>
          <h2 style={{ fontSize: 40, fontWeight: 800 }}>Fundar uma mesa</h2>
          <p className="subtitle">Dê um nome, escolha o tomo de regras e convoque quem vai sentar à mesa.</p>
        </header>

        <ol className="steps fund-steps" aria-label="Passos">
          {STEP_LABELS.map((label, i) => (
            <li key={label} className={`step ${step === i + 1 ? "current" : step > i + 1 ? "done" : ""}`} style={{ listStyle: "none", display: "flex", alignItems: "center" }}>
              {i > 0 && <span className="step-line" />}
              <span className="n">{["I", "II", "III"][i]}</span>
              <span className="t">{label}</span>
            </li>
          ))}
        </ol>

        <div className="fund-grid">
          <div className="stack" style={{ gap: 28, minWidth: 0 }}>
            <div className={`${section(1)} parchment stack`}>
              <label>Nome<input className="name-input" value={name} onChange={(e) => setName(e.target.value)} required={step === 1 || step === 3} /></label>
              <label>
                Sistema
                <input value={system} onChange={(e) => setSystem(e.target.value)} placeholder="Ex.: Tormenta adaptado" />
              </label>
              <label>Frequência<input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="Ex.: quinzenal, às sextas (opcional)" /></label>
              <label>Prólogo<textarea className="ruled" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /></label>
            </div>

            <fieldset className={`${section(2)} stack`} style={{ border: 0, padding: 0, margin: 0, gap: 14 }}>
              <legend className="section-title" style={{ width: "100%", padding: 0, marginBottom: 14 }}>
                <h2 style={{ fontSize: 24 }}>Tomo de regras</h2>
              </legend>
              <div className="tomes" role="radiogroup" aria-label="Comece com um modelo de ficha">
                {EXAMPLE_TEMPLATES.map((example) => (
                  <label
                    key={example.id} className={`tome ${templateId === example.id ? "selected" : ""}`}
                    style={{ ["--tome" as string]: TOME_COLORS[example.id] ?? "#3d3226" }}
                  >
                    <input type="radio" name="template" value={example.id} checked={templateId === example.id} onChange={() => setTemplateId(example.id)} />
                    {templateId === example.id && <span className="ribbon">Escolhido</span>}
                    <strong>{example.name}</strong>
                    {example.system && <span className="desc">{example.system}</span>}
                    <span className="desc">{example.description}</span>
                    <span className="dice">{TOME_DICE[example.id] ?? ""}</span>
                  </label>
                ))}
              </div>
              {selectedExample && <TemplatePreview example={selectedExample} />}
            </fieldset>
          </div>

          <aside className={`${section(3)} leather stack fund-seats`} aria-label="Cadeiras à mesa" style={{ alignSelf: "start", position: "sticky", top: 16 }}>
            <h2 style={{ fontSize: 24 }}>Cadeiras à mesa</h2>
            <RoundTable seats={seatsAround(seats)} width={260} height={260} radius={108} topSize={150} compact />
            <div className="row" style={{ justifyContent: "center", gap: 16 }}>
              <span className="stepper" role="group" aria-label="Jogadores">
                <button type="button" className="secondary" aria-label="Menos um jogador" disabled={seats <= MIN_SEATS} onClick={() => setSeats(clampSeats(seats - 1))}>−</button>
                <span className="out" aria-live="polite">{seats}</span>
                <button type="button" className="secondary" aria-label="Mais um jogador" disabled={seats >= MAX_SEATS} onClick={() => setSeats(clampSeats(seats + 1))}>+</button>
              </span>
              <span className="eyebrow">jogadores</span>
            </div>
            <button type="button" className="btn-lg fund-submit" disabled={!name.trim()} onClick={() => create("tavola")}>Fundar mesa e convocar</button>
            <button type="button" className="secondary fund-submit" disabled={!name.trim()} onClick={() => create("ficha")}>Fundar sem convocar agora</button>
          </aside>
        </div>

        <div className="fund-footer">
          <button type="button" className="secondary" disabled={step === 1} onClick={() => setStep(step - 1)} style={{ flex: 1 }}>Voltar</button>
          {step < 3 && <button type="submit" style={{ flex: 2 }}>{step === 1 ? "Tomo ›" : "Cadeiras ›"}</button>}
        </div>
      </form>
    </div>
  );
};
