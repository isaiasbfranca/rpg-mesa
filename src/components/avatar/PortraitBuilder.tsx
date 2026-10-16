"use client";

import {
  colorLabel,
  LAYER_GROUPS,
  optionsOf,
  paletteOf,
  thumbnailConfig,
  type LayerField,
  type PortraitConfig,
  type PortraitKey,
  type ThumbView,
} from "@/domain/portrait";
import type { PortraitMode } from "@/domain/portraitSvg";
import type { KeyboardEvent } from "react";
import { Portrait } from "./Portrait";

type Props = {
  cfg: PortraitConfig;
  groupId: string;
  onGroupChange: (groupId: string) => void;
  onChange: (key: PortraitKey, value: string, fromPicker?: boolean) => void;
};

/** Miniatura da aba de cada grupo: o próprio retrato, no recorte que mais muda. */
const tabMode = (view: ThumbView): PortraitMode => (view === "torso" ? "head" : view === "full" ? "circle" : view);
const thumbMode = (view: ThumbView): PortraitMode => (view === "full" ? "card" : view);
const thumbSize = (view: ThumbView) => (view === "torso" ? 150 : view === "full" ? 84 : 96);

const firstView = (fields: LayerField[]) => fields.find((f) => f.kind === "opcao")?.view ?? "full";

const OptionField = ({ field, cfg, onChange }: { field: Extract<LayerField, { kind: "opcao" }>; cfg: PortraitConfig; onChange: Props["onChange"] }) => (
  <fieldset className="portrait-field">
    <legend>
      {field.label} <span className="muted">· {optionsOf(field.key).length} opções</span>
    </legend>
    <div className={`portrait-options${field.view === "torso" ? " wide" : ""}`} role="radiogroup" aria-label={field.label}>
      {optionsOf(field.key).map(([id, label]) => (
        <label key={id} className="portrait-option">
          <input type="radio" name={`retrato-${field.key}`} value={id} checked={cfg[field.key] === id} onChange={() => onChange(field.key, id)} />
          <Portrait cfg={thumbnailConfig(cfg, field.key, id)} size={thumbSize(field.view)} mode={thumbMode(field.view)} />
          <span>{label}</span>
        </label>
      ))}
    </div>
  </fieldset>
);

const ColorField = ({ field, cfg, onChange }: { field: Extract<LayerField, { kind: "cor" }>; cfg: PortraitConfig; onChange: Props["onChange"] }) => {
  const current = cfg[field.key];
  const known = paletteOf(field.palette).some(([, hex]) => hex.toLowerCase() === current.toLowerCase());
  return (
    <fieldset className="portrait-field">
      <legend>
        {field.label} <span className="muted">· {colorLabel(field.palette, current)}</span>
      </legend>
      <div className="row" role="radiogroup" aria-label={field.label}>
        {paletteOf(field.palette).map(([label, hex]) => (
          <label key={hex} className="swatch" style={{ background: hex }} title={label}>
            <input
              type="radio" name={`cor-${field.key}`} value={hex} aria-label={label}
              checked={current.toLowerCase() === hex.toLowerCase()} onChange={() => onChange(field.key, hex)}
            />
          </label>
        ))}
        <label className="swatch swatch-custom" title="Escolher outra cor" style={known ? undefined : { background: current }}>
          <input type="color" value={current.toLowerCase()} aria-label={`Outra cor para ${field.label.toLowerCase()}`} onChange={(e) => onChange(field.key, e.target.value, true)} />
          {known && <span aria-hidden="true">+</span>}
        </label>
      </div>
    </fieldset>
  );
};

/** Abas por grupo (Cenário, Raça, Rosto…) e, em cada uma, opções com miniatura do próprio retrato. */
export const PortraitBuilder = ({ cfg, groupId, onGroupChange, onChange }: Props) => {
  const group = LAYER_GROUPS.find((g) => g.id === groupId) ?? LAYER_GROUPS[0]!;

  // Abas com tabindex móvel: Tab entra só na aba atual; setas, Home e End trocam de aba (DEF-16).
  const moveTab = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = LAYER_GROUPS.indexOf(group);
    const last = LAYER_GROUPS.length - 1;
    const target = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[event.key];
    const next = target === undefined ? undefined : LAYER_GROUPS[target];
    if (!next) return;
    event.preventDefault();
    onGroupChange(next.id);
    document.getElementById(`aba-${next.id}`)?.focus();
  };
  return (
    <div className="stack">
      <div className="portrait-tabs" role="tablist" aria-label="Camadas">
        {LAYER_GROUPS.map((g) => (
          <button
            key={g.id} type="button" role="tab" id={`aba-${g.id}`} aria-selected={g.id === group.id} aria-controls={`painel-${g.id}`}
            tabIndex={g.id === group.id ? 0 : -1} onClick={() => onGroupChange(g.id)} onKeyDown={moveTab}
          >
            <Portrait cfg={cfg} size={40} mode={tabMode(firstView(g.fields))} />
            <span>{g.label}</span>
          </button>
        ))}
      </div>
      <div className="stack" role="tabpanel" id={`painel-${group.id}`} aria-labelledby={`aba-${group.id}`}>
        {group.fields.map((field) =>
          field.kind === "opcao" ? (
            <OptionField key={field.key} field={field} cfg={cfg} onChange={onChange} />
          ) : (
            <ColorField key={field.key} field={field} cfg={cfg} onChange={onChange} />
          ),
        )}
      </div>
    </div>
  );
};
