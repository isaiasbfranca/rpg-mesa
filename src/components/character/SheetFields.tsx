"use client";

import { attributeModifier, formatModifier, type Field, type FieldValue, type ModifierRule, type SheetTemplate } from "@/domain/sheet";

type Props = {
  template: SheetTemplate;
  values: Record<string, FieldValue>;
  modifierRule: ModifierRule;
  readOnly?: boolean;
  onChange?: (fieldId: string, value: FieldValue) => void;
  onRollAttribute?: (field: Field, modifier: number) => void;
};

const asNumber = (value: FieldValue | undefined) => (typeof value === "number" ? value : Number(value) || 0);
const asText = (value: FieldValue | undefined) => (typeof value === "string" ? value : "");

const FieldInput = ({ field, value, modifierRule, readOnly, onChange, onRollAttribute }: Omit<Props, "template" | "values"> & { field: Field; value: FieldValue | undefined }) => {
  const set = (next: FieldValue) => onChange?.(field.id, next);
  const labelText = (
    <>
      <span>{field.label}{field.required && <span aria-hidden> *</span>}</span>
      {field.help && <span className="help">{field.help}</span>}
    </>
  );

  switch (field.type) {
    case "texto":
      return <label>{labelText}<input value={asText(value)} readOnly={readOnly} required={field.required} onChange={(e) => set(e.target.value)} /></label>;
    case "textoLongo":
      return <label style={{ gridColumn: "1 / -1" }}>{labelText}<textarea rows={4} value={asText(value)} readOnly={readOnly} onChange={(e) => set(e.target.value)} /></label>;
    case "numero":
      return (
        <label>
          {labelText}
          <input
            type="number" inputMode="numeric" value={value === "" || value === undefined ? "" : asNumber(value)} readOnly={readOnly}
            onChange={(e) => set(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </label>
      );
    case "caixa":
      return (
        <label className="inline">
          <input type="checkbox" checked={value === true} disabled={readOnly} onChange={(e) => set(e.target.checked)} />
          {field.label}
        </label>
      );
    case "lista":
      return (
        <label>
          {labelText}
          <select value={asText(value)} disabled={readOnly} onChange={(e) => set(e.target.value)}>
            <option value="">—</option>
            {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      );
    case "atributo": {
      const filled = value !== "" && value !== undefined;
      const modifier = filled ? attributeModifier(modifierRule, asNumber(value)) : 0;
      return (
        <div className="attr stack" style={{ alignItems: "center", gap: 6 }}>
          <div className={`shield ${filled ? "" : "empty"} ${modifier < 0 ? "neg" : ""}`}>
            <label style={{ alignItems: "center", textAlign: "center", color: "inherit" }}>
              <span className="lbl">{field.label}</span>
              <input
                type="number" inputMode="numeric" value={filled ? asNumber(value) : ""} readOnly={readOnly}
                onChange={(e) => set(e.target.value === "" ? "" : Number(e.target.value))}
                className="val" style={{ width: 80, textAlign: "center", background: "transparent", border: 0, color: "inherit", minHeight: 44, padding: 0 }}
              />
            </label>
            {modifierRule !== "nenhum" && <span className="mod">mod {filled ? formatModifier(modifier) : "—"}</span>}
          </div>
          {onRollAttribute && (
            <button type="button" className="secondary" onClick={() => onRollAttribute(field, modifier)} aria-label={`Rolar ${field.label}`}>
              🎲 Rolar
            </button>
          )}
        </div>
      );
    }
  }
};

export const SheetFields = ({ template, values, ...rest }: Props) => (
  <div className="stack">
    {template.sections.map((section) => (
      <section key={section.id} className="parchment stack" aria-label={section.title}>
        <h2>{section.title}</h2>
        {section.fields.length === 0 && <p className="muted">Seção sem campos.</p>}
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", justifyItems: "stretch" }}>
          {section.fields.map((field) => (
            <FieldInput key={field.id} field={field} value={values[field.id]} {...rest} />
          ))}
        </div>
      </section>
    ))}
  </div>
);
