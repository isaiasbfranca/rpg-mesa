"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CharacterAvatar } from "@/components/avatar/CharacterAvatar";
import { PresetGallery } from "@/components/avatar/PresetGallery";
import { useCampaign } from "@/components/campaign/CampaignContext";
import { repository } from "@/data";
import type { Avatar } from "@/domain/avatar";
import { rollAbilityPool } from "@/domain/abilityScores";
import { canCreateNpc } from "@/domain/permissions";
import { allFields, attributeModifier, formatModifier, valuesForTemplate, type Field, type FieldValue } from "@/domain/sheet";
import { useActor } from "@/hooks/useActor";

const CHAPTERS = ["Origem", "Atributos", "Semblante", "Juramento"];
const ROMAN = ["I", "II", "III", "IV"];
type Method = "rolar" | "escrever";

const isIdentityField = (field: Field) => field.type === "texto" || field.type === "textoLongo" || field.type === "numero";

/** Assistente de personagem em quatro capítulos (2e/2f): o resultado é uma ficha comum, editável depois. */
export const CharacterWizard = () => {
  const router = useRouter();
  const { campaign } = useCampaign();
  const actor = useActor();
  const [chapter, setChapter] = useState(0);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"pj" | "npc">("pj");
  const [identity, setIdentity] = useState<Record<string, FieldValue>>({});
  const [method, setMethod] = useState<Method>("rolar");
  const [pool, setPool] = useState<number[]>([]);
  const [selected, setSelected] = useState<number>();
  /** Atributo → posição no conjunto lançado. */
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const [typed, setTyped] = useState<Record<string, FieldValue>>({});
  const [avatar, setAvatar] = useState<Avatar>();
  const [saving, setSaving] = useState(false);

  const fields = allFields(campaign.template);
  const attributes = fields.filter((f) => f.type === "atributo");
  const identityFields = fields.filter(isIdentityField);
  const usedSlots = new Set(Object.values(assignments));

  const attributeValue = (field: Field): FieldValue => {
    if (method === "escrever") return typed[field.id] ?? "";
    const slot = assignments[field.id];
    return slot === undefined ? "" : (pool[slot] ?? "");
  };

  const throwPool = () => {
    setPool(rollAbilityPool(attributes.length));
    setAssignments({});
    setSelected(undefined);
  };

  const assign = (field: Field) => {
    if (selected === undefined) {
      setAssignments((current) => Object.fromEntries(Object.entries(current).filter(([id]) => id !== field.id)));
      return;
    }
    setAssignments((current) => ({ ...current, [field.id]: selected }));
    setSelected(undefined);
  };

  const finish = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    const attributeValues = Object.fromEntries(attributes.map((f) => [f.id, attributeValue(f)]));
    const character = await repository.createCharacter({
      campaignId: campaign.id,
      name: name.trim(),
      kind,
      hidden: kind === "npc",
      avatar,
      values: valuesForTemplate(campaign.template, { ...identity, ...attributeValues }),
    });
    router.push(`/campanhas/${campaign.id}/personagens/${character.id}`);
  };

  const next = () => setChapter((c) => Math.min(c + 1, CHAPTERS.length - 1));
  const back = () => setChapter((c) => Math.max(c - 1, 0));
  const nameMissing = !name.trim();

  return (
    <div className="stack" style={{ gap: 20 }}>
      <header className="stack" style={{ gap: 4 }}>
        <p className="eyebrow">{campaign.name} · novo personagem</p>
        <h2 style={{ fontSize: 34 }}>{name.trim() || "Novo personagem"}</h2>
      </header>

      <ol className="steps" aria-label="Capítulos" style={{ margin: 0, padding: 0 }}>
        {CHAPTERS.map((title, i) => (
          <li key={title} className={`step ${chapter === i ? "current" : chapter > i ? "done" : ""}`} style={{ listStyle: "none", display: "flex", alignItems: "center" }} aria-current={chapter === i ? "step" : undefined}>
            {i > 0 && <span className="step-line" />}
            <span className="n">{ROMAN[i]}</span>
            <span className="t">{title}</span>
          </li>
        ))}
      </ol>

      <div className="wizard-grid">
        <aside className="stack" style={{ alignItems: "center", gap: 0 }}>
          <span className="portrait-frame">
            <CharacterAvatar avatar={avatar} name={name || "?"} size={240} mode="card" />
          </span>
        </aside>

        <section className="parchment stack" aria-label={`Capítulo ${ROMAN[chapter]} · ${CHAPTERS[chapter]}`}>
          <p className="eyebrow">Capítulo {ROMAN[chapter]} · {CHAPTERS[chapter]}</p>

          {chapter === 0 && (
            <>
              <label>Nome do personagem<input className="name-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></label>
              {canCreateNpc(actor, campaign) && (
                <label>
                  Tipo
                  <select value={kind} onChange={(e) => setKind(e.target.value === "npc" ? "npc" : "pj")}>
                    <option value="pj">Personagem de jogador</option>
                    <option value="npc">NPC</option>
                  </select>
                </label>
              )}
              {identityFields.map((field) =>
                field.type === "textoLongo" ? (
                  <label key={field.id}>{field.label}<textarea className="ruled" rows={4} value={String(identity[field.id] ?? "")} onChange={(e) => setIdentity({ ...identity, [field.id]: e.target.value })} /></label>
                ) : (
                  <label key={field.id}>
                    {field.label}
                    <input
                      type={field.type === "numero" ? "number" : "text"} value={String(identity[field.id] ?? "")}
                      onChange={(e) => setIdentity({ ...identity, [field.id]: field.type === "numero" && e.target.value !== "" ? Number(e.target.value) : e.target.value })}
                    />
                  </label>
                ),
              )}
            </>
          )}

          {chapter === 1 && (
            <>
              <div className="row spread">
                <h2>Atributos</h2>
                <div className="segmented" role="group" aria-label="Método">
                  <button type="button" aria-pressed={method === "rolar"} onClick={() => setMethod("rolar")}>Rolar 4d6</button>
                  <button type="button" aria-pressed={method === "escrever"} onClick={() => setMethod("escrever")}>Escrever</button>
                </div>
              </div>
              {attributes.length === 0 && <p className="subtitle">Este modelo não tem atributos. Siga para o próximo capítulo.</p>}
              {method === "rolar" && attributes.length > 0 && (
                <>
                  <div className="felt-tray pool" aria-label="Valores lançados">
                    {pool.length === 0 && <p className="subtitle" style={{ color: "rgba(239,228,204,.7)" }}>Lance os dados para começar.</p>}
                    {pool.map((value, slot) => (
                      <button
                        key={slot} type="button" className="pool-value" aria-pressed={selected === slot} disabled={usedSlots.has(slot)}
                        aria-label={`Valor ${value}`} onClick={() => setSelected(selected === slot ? undefined : slot)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="secondary" onClick={throwPool} style={{ alignSelf: "flex-start" }}>
                    {pool.length === 0 ? "Lançar 4d6" : "Lançar de novo"}
                  </button>
                </>
              )}
              <div className="shield-grid">
                {attributes.map((field) => {
                  const value = attributeValue(field);
                  const filled = value !== "";
                  const modifier = filled ? attributeModifier(campaign.modifierRule, Number(value)) : 0;
                  return method === "rolar" ? (
                    <button
                      key={field.id} type="button" className={`shield ${filled ? "" : "empty"} ${modifier < 0 ? "neg" : ""}`}
                      onClick={() => assign(field)} aria-label={`${field.label}: ${filled ? value : "vazio"}`}
                    >
                      <span className="lbl">{field.label}</span>
                      <span className="val">{filled ? value : "?"}</span>
                      {filled && campaign.modifierRule !== "nenhum" && <span className="mod">{formatModifier(modifier)}</span>}
                    </button>
                  ) : (
                    <label key={field.id} style={{ alignItems: "center" }}>
                      {field.label}
                      <input
                        type="number" inputMode="numeric" value={String(typed[field.id] ?? "")} style={{ width: 80, textAlign: "center" }}
                        onChange={(e) => setTyped({ ...typed, [field.id]: e.target.value === "" ? "" : Number(e.target.value) })}
                      />
                    </label>
                  );
                })}
              </div>
              {method === "rolar" && attributes.length > 0 && <p className="subtitle">Toque num valor e depois num escudo para atribuir. Toque num escudo sem valor escolhido para esvaziá-lo.</p>}
            </>
          )}

          {chapter === 2 && (
            <>
              <h2>Semblante</h2>
              <p className="subtitle">Escolha um arquétipo. Depois você monta o retrato peça por peça na ficha, se quiser.</p>
              <PresetGallery
                selectedId={avatar?.kind === "camadas" ? avatar.presetId : undefined}
                onSelect={(preset) => setAvatar({ kind: "camadas", cfg: preset.cfg, presetId: preset.id })}
              />
            </>
          )}

          {chapter === 3 && (
            <>
              <h2>Juramento</h2>
              <p className="subtitle">Confira e sele a ficha. Tudo pode ser editado depois.</p>
              <dl className="stack" style={{ margin: 0, gap: 6 }}>
                <div><dt className="eyebrow">Nome</dt><dd style={{ margin: 0 }}>{name.trim() || "—"}</dd></div>
                {attributes.map((f) => (
                  <div key={f.id} className="row spread"><dt>{f.label}</dt><dd className="mono" style={{ margin: 0 }}>{String(attributeValue(f)) || "—"}</dd></div>
                ))}
              </dl>
              {nameMissing && <p className="error" role="alert">Dê um nome ao personagem no capítulo I.</p>}
            </>
          )}

          <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
            {chapter === 0 ? (
              <Link href={`/campanhas/${campaign.id}`} className="btn-ghost back-link" style={{ padding: "0 16px", textDecoration: "none", border: "1px solid var(--gold-deep)", borderRadius: 8, fontFamily: "var(--f-label)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Cancelar</Link>
            ) : (
              <button type="button" className="secondary" onClick={back}>‹ {CHAPTERS[chapter - 1]}</button>
            )}
            {chapter < CHAPTERS.length - 1 ? (
              <button type="button" disabled={chapter === 0 && nameMissing} onClick={next}>{CHAPTERS[chapter + 1]} ›</button>
            ) : (
              <button type="button" disabled={nameMissing || saving} onClick={finish}>Criar personagem</button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
