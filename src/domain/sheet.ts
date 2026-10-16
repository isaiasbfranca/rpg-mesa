export type ModifierRule = "nenhum" | "dnd" | "direto";

export const MODIFIER_RULE_LABELS: Record<ModifierRule, string> = {
  nenhum: "Sem modificador",
  dnd: "Estilo D&D: (valor − 10) ÷ 2",
  direto: "Valor direto",
};

type FieldBase = { id: string; label: string; help?: string; required: boolean };

export type Field = FieldBase &
  (
    | { type: "texto" }
    | { type: "textoLongo" }
    | { type: "numero" }
    | { type: "atributo" }
    | { type: "lista"; options: string[] }
    | { type: "caixa" }
  );

export type FieldType = Field["type"];

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  texto: "Texto curto",
  textoLongo: "Texto longo",
  numero: "Número",
  atributo: "Atributo (com modificador)",
  lista: "Lista de opções",
  caixa: "Caixa de seleção",
};

export type Section = { id: string; title: string; fields: Field[] };

export type SheetTemplate = { version: number; sections: Section[] };

export type FieldValue = string | number | boolean;

/** Modificador de um atributo segundo a regra da campanha (RF-07). */
export const attributeModifier = (rule: ModifierRule, value: number): number => {
  switch (rule) {
    case "nenhum":
      return 0;
    case "dnd":
      return Math.floor((value - 10) / 2);
    case "direto":
      return value;
  }
};

export const formatModifier = (modifier: number): string => (modifier >= 0 ? `+${modifier}` : `${modifier}`);

export const emptyValue = (field: Field): FieldValue => {
  switch (field.type) {
    case "numero":
    case "atributo":
      return "";
    case "caixa":
      return false;
    case "lista":
      return "";
    case "texto":
    case "textoLongo":
      return "";
  }
};

/** Vazio = não preenchido. Número 0 é valor de verdade; caixa desmarcada conta como vazia. */
const isBlank = (value: FieldValue | undefined) => value === undefined || value === "" || value === false;

export const allFields = (template: SheetTemplate): Field[] => template.sections.flatMap((s) => s.fields);

/** Valores de uma ficha completados pelo modelo atual: campo novo entra vazio (RF-08). */
export const valuesForTemplate = (
  template: SheetTemplate,
  values: Record<string, FieldValue>,
): Record<string, FieldValue> =>
  Object.fromEntries(allFields(template).map((field) => [field.id, values[field.id] ?? emptyValue(field)]));

export const missingRequiredFields = (template: SheetTemplate, values: Record<string, FieldValue>): Field[] =>
  allFields(template).filter((field) => field.required && isBlank(values[field.id]));

const bump = (template: SheetTemplate, sections: Section[]): SheetTemplate => ({
  version: template.version + 1,
  sections,
});

export const addSection = (template: SheetTemplate, section: Section): SheetTemplate =>
  bump(template, [...template.sections, section]);

export const addField = (template: SheetTemplate, sectionId: string, field: Field): SheetTemplate =>
  bump(
    template,
    template.sections.map((s) => (s.id === sectionId ? { ...s, fields: [...s.fields, field] } : s)),
  );

export const removeField = (template: SheetTemplate, fieldId: string): SheetTemplate =>
  bump(
    template,
    template.sections.map((s) => ({ ...s, fields: s.fields.filter((f) => f.id !== fieldId) })),
  );

/** Trocar o tipo de um campo só é permitido se nenhuma ficha tiver valor nele (RF-08). */
export const fieldHasValues = (
  fieldId: string,
  characters: { values: Record<string, FieldValue> }[],
): boolean =>
  characters.some((c) => !isBlank(c.values[fieldId]));
