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
  FIELD_TYPE_LABELS,
  MODIFIER_RULE_LABELS,
  removeField,
  valuesForTemplate,
  type Field,
  type FieldType,
  type ModifierRule,
} from "@/domain/sheet";
import type { Character } from "@/domain/types";

const DIE_OPTIONS = [4, 6, 8, 10, 12, 20, 100];

const newFieldId = (label: string) =>
  `${label.normalize("NFD").replace(/[^\w]+/g, "-").toLowerCase().slice(0, 24)}-${crypto.randomUUID().slice(0, 6)}`;

const buildField = (label: string, type: FieldType, required: boolean, options: string): Field => {
  const base = { id: newFieldId(label), label, required };
  if (type === "lista") return { ...base, type, options: options.split(",").map((o) => o.trim()).filter(Boolean) };
  return { ...base, type };
};

const AddFieldForm = ({ onAdd }: { onAdd: (field: Field) => void }) => {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<FieldType>("texto");
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
    <form className="row" onSubmit={handleSubmit} style={{ alignItems: "flex-end" }}>
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
      <button type="submit" className="secondary">Adicionar</button>
    </form>
  );
};

export const TemplateEditor = () => {
  const { campaign, saveCampaign } = useCampaign();
  const actor = useActor();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const { template } = campaign;

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
    <div className="stack">
      <section className="card stack" aria-label="Regras de rolagem">
        <h2>Regras</h2>
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

      {template.sections.map((section) => (
        <section key={section.id} className="card stack" aria-label={`Seção ${section.title}`}>
          <h2>{section.title}</h2>
          <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {section.fields.map((field) => (
              <li key={field.id} className="row spread">
                <span>
                  {field.label} <span className="tag">{FIELD_TYPE_LABELS[field.type]}</span>
                  {field.required && <span className="tag">obrigatório</span>}
                </span>
                <button type="button" className="danger" onClick={() => handleRemove(field)} aria-label={`Remover ${field.label}`}>Remover</button>
              </li>
            ))}
          </ul>
          <AddFieldForm onAdd={(field) => saveCampaign({ ...campaign, template: addField(template, section.id, field) })} />
        </section>
      ))}

      <form className="card row" onSubmit={handleAddSection} style={{ alignItems: "flex-end" }}>
        <label style={{ flex: "1 1 200px" }}>Nova seção<input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="Ex.: Perícias" /></label>
        <button type="submit" className="secondary">Adicionar seção</button>
      </form>

      <h2>Pré-visualização</h2>
      <p className="muted">Modelo versão {template.version}. É assim que os jogadores verão a ficha.</p>
      <SheetFields template={template} values={valuesForTemplate(template, {})} modifierRule={campaign.modifierRule} readOnly />
    </div>
  );
};
