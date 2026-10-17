"use client";

import { useActor } from "@/hooks/useActor";
import { useEffect, useState, type FormEvent } from "react";
import { useCampaign } from "@/components/campaign/CampaignContext";
import { SheetFields } from "@/components/character/SheetFields";
import { repository } from "@/data";
import { canEditCampaign } from "@/domain/permissions";
import {
  addField,
  addSection,
  fieldHasValues,
  moveSection,
  FIELD_TYPE_LABELS,
  MODIFIER_RULE_LABELS,
  removeField,
  valuesForTemplate,
  type Field,
  type FieldType,
  type ModifierRule,
} from "@/domain/sheet";
import type { Character } from "@/domain/types";

const TYPE_GLYPHS: Record<FieldType, string> = { texto: "Aa", textoLongo: "¶", numero: "12", caixa: "✓", lista: "≡", atributo: "◆" };
const TYPE_TILE_LABELS: Record<FieldType, string> = { texto: "Texto", textoLongo: "Texto longo", numero: "Número", caixa: "Caixa", lista: "Lista", atributo: "Atributo" };
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const DIE_OPTIONS = [4, 6, 8, 10, 12, 20, 100];

const newFieldId = (label: string) =>
  `${label.normalize("NFD").replace(/[^\w]+/g, "-").toLowerCase().slice(0, 24)}-${crypto.randomUUID().slice(0, 6)}`;

const buildField = (label: string, type: FieldType, required: boolean, options: string): Field => {
  const base = { id: newFieldId(label), label, required };
  if (type === "lista") return { ...base, type, options: options.split(",").map((o) => o.trim()).filter(Boolean) };
  return { ...base, type };
};

const AddFieldForm = ({ onAdd, type, onTypeChange, onCancel, sectionTitle }: { onAdd: (field: Field) => void; type: FieldType; onTypeChange: (type: FieldType) => void; onCancel: () => void; sectionTitle: string }) => {
  const [label, setLabel] = useState("");
  const setType = onTypeChange;
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!label.trim()) return;
    onAdd(buildField(label.trim(), type, required, options));
    setLabel("");
    setOptions("");
  };

  return (
    <form className="row field-form" onSubmit={handleSubmit} style={{ alignItems: "flex-end" }}>
      <span className="sheet-handle sheet-only" aria-hidden />
      <p className="sheet-only" style={{ flex: "1 1 100%" }}><strong style={{ fontFamily: "var(--f-display)", fontSize: 22 }}>Novo campo</strong> <span className="eyebrow">em {sectionTitle}</span></p>
      <label style={{ flex: "1 1 160px" }}>Novo campo<input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Rótulo" /></label>
      <label>
        Tipo
        <select value={type} onChange={(e) => setType(e.target.value as FieldType)}>
          {Object.entries(FIELD_TYPE_LABELS).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
        </select>
      </label>
      {type === "lista" && (
        <label style={{ flex: "1 1 160px" }}>Opções<input value={options} onChange={(e) => setOptions(e.target.value)} placeholder="Separe por vírgula" /></label>
      )}
      <label className="inline"><input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />Obrigatório</label>
      <button type="button" className="secondary sheet-only" onClick={onCancel}>Cancelar</button>
      <button type="submit" className="secondary">Adicionar</button>
    </form>
  );
};

export const TemplateEditor = () => {
  const { campaign, saveCampaign } = useCampaign();
  const actor = useActor();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const [selectedId, setSelectedId] = useState<string>();
  const [newType, setNewType] = useState<FieldType>("texto");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string>();
  const { template } = campaign;
  const selectedIndex = Math.max(0, template.sections.findIndex((section) => section.id === selectedId));
  const selected = template.sections[selectedIndex];

  useEffect(() => {
    repository.listCharacters(campaign.id).then(setCharacters);
  }, [campaign.id]);

  if (!canEditCampaign(actor, campaign)) return <p className="muted">Só a mestra edita o modelo de ficha.</p>;

  const handleRemove = (field: Field) => {
    const warning = fieldHasValues(field.id, characters)
      ? `Algumas fichas já preencheram "${field.label}". Remover apaga esses valores. Continuar?`
      : `Remover o campo "${field.label}"?`;
    if (window.confirm(warning)) saveCampaign({ ...campaign, template: removeField(template, field.id) });
  };

  const handleAddSection = (event: FormEvent) => {
    event.preventDefault();
    if (!sectionTitle.trim()) return;
    saveCampaign({ ...campaign, template: addSection(template, { id: newFieldId(sectionTitle), title: sectionTitle.trim(), fields: [] }) });
    setSectionTitle("");
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <p className="mono muted" style={{ textAlign: "right", fontSize: 13 }}>edição {template.version} · gravado</p>
      <div className="template-grid">
        <nav className="leather toc stack" aria-label="Sumário do modelo" style={{ gap: 4 }}>
          {template.sections.map((section, index) => (
            <div
              key={section.id} className="toc-item" draggable
              onDragStart={() => setDraggingId(section.id)} onDragEnd={() => setDraggingId(undefined)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => draggingId && saveCampaign({ ...campaign, template: moveSection(template, draggingId, index) })}
            >
              <button type="button" aria-current={index === selectedIndex} onClick={() => setSelectedId(section.id)}>
                <span style={{ color: "var(--gold)", marginRight: 8, fontFamily: "var(--f-display)" }}>{ROMAN[index] ?? index + 1}</span>
                {section.title}
              </button>
              <button type="button" className="link-btn" aria-label={`Subir ${section.title}`} disabled={index === 0} onClick={() => saveCampaign({ ...campaign, template: moveSection(template, section.id, index - 1) })}>↑</button>
              <button type="button" className="link-btn" aria-label={`Descer ${section.title}`} disabled={index === template.sections.length - 1} onClick={() => saveCampaign({ ...campaign, template: moveSection(template, section.id, index + 1) })}>↓</button>
            </div>
          ))}
          <form onSubmit={handleAddSection} className="stack" style={{ gap: 8, marginTop: 8 }}>
            <label>Nova seção<input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="Ex.: Perícias" /></label>
            <button type="submit" className="secondary">Adicionar seção</button>
          </form>
        </nav>

        <div className="stack" style={{ gap: 20, minWidth: 0 }}>
          <section className="parchment stack" aria-label="Regras de rolagem">
            <h2 style={{ fontSize: 24 }}>Regras</h2>
            <div className="row">
              <label style={{ flex: "1 1 240px" }}>
                Modificador de atributo
                <select value={campaign.modifierRule} onChange={(e) => saveCampaign({ ...campaign, modifierRule: e.target.value as ModifierRule })}>
                  {Object.entries(MODIFIER_RULE_LABELS).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                </select>
              </label>
              <label>
                Dado do atributo
                <select value={campaign.defaultDie} onChange={(e) => saveCampaign({ ...campaign, defaultDie: Number(e.target.value) })}>
                  {DIE_OPTIONS.map((sides) => <option key={sides} value={sides}>d{sides}</option>)}
                </select>
              </label>
            </div>
          </section>

          {selected && (
            <section key={selected.id} className="parchment stack" aria-label={`Seção ${selected.title}`}>
              <div className="section-title"><h2>{ROMAN[selectedIndex] ?? selectedIndex + 1} · {selected.title}</h2></div>
              <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {selected.fields.map((field) => (
                  <li key={field.id} className="row spread">
                    <span>
                      {field.label} <span className="tag">{FIELD_TYPE_LABELS[field.type]}</span>
                      {field.required && <span className="tag">obrigatório</span>}
                    </span>
                    <button type="button" className="danger" onClick={() => handleRemove(field)} aria-label={`Riscar ${field.label}`}>Riscar</button>
                  </li>
                ))}
              </ul>
              <button type="button" className="secondary open-sheet" onClick={() => setSheetOpen(true)}>Adicionar campo</button>
              <div className={`field-sheet ${sheetOpen ? "open" : ""}`}>
                <div className="sheet-backdrop" onClick={() => setSheetOpen(false)} aria-hidden />
                <div className="sheet-body leather">
                  <AddFieldForm
                    type={newType} onTypeChange={setNewType} sectionTitle={selected.title} onCancel={() => setSheetOpen(false)}
                    onAdd={(field) => {
                      saveCampaign({ ...campaign, template: addField(template, selected.id, field) });
                      setSheetOpen(false);
                    }}
                  />
                </div>
              </div>
              <p className="subtitle">Fichas já escritas ganham o campo novo em branco. Nenhum valor é apagado.</p>
            </section>
          )}

          <section className="stack" aria-label="Pré-visualização">
            <h2 style={{ fontSize: 24 }}>Pré-visualização</h2>
            <p className="muted subtitle">Modelo versão {template.version}. É assim que os jogadores verão a ficha.</p>
            <SheetFields template={template} values={valuesForTemplate(template, {})} modifierRule={campaign.modifierRule} readOnly />
          </section>
        </div>

        <aside className="leather stack" aria-label="Componentes">
          <h2 style={{ fontSize: 22 }}>Componentes</h2>
          <div className="type-tiles" role="group" aria-label="Tipo do novo campo">
            {(Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map((type) => (
              <button key={type} type="button" className="type-tile" aria-pressed={newType === type} onClick={() => setNewType(type)} style={newType === type ? { borderColor: "var(--gold)" } : undefined}>
                <b>{TYPE_GLYPHS[type]}</b>
                {TYPE_TILE_LABELS[type]}
              </button>
            ))}
          </div>
          <p className="help">Escolha o tipo e dê um rótulo no formulário da seção.</p>
        </aside>
      </div>
    </div>
  );
};
