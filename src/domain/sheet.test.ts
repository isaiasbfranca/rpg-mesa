import { describe, expect, it } from "vitest";
import {
  addField,
  attributeModifier,
  fieldHasValues,
  missingRequiredFields,
  removeField,
  valuesForTemplate,
  type SheetTemplate,
} from "./sheet";

const template: SheetTemplate = {
  version: 1,
  sections: [
    {
      id: "s1",
      title: "Atributos",
      fields: [
        { id: "for", label: "Força", type: "atributo", required: true },
        { id: "nome", label: "Apelido", type: "texto", required: false },
      ],
    },
  ],
};

describe("attributeModifier", () => {
  it.each([
    [10, 0],
    [11, 0],
    [12, 1],
    [9, -1],
    [8, -1],
    [1, -5],
    [30, 10],
  ])("D&D: %i → %i", (value, expected) => {
    expect(attributeModifier("dnd", value)).toBe(expected);
  });

  it("valor direto e nenhum", () => {
    expect(attributeModifier("direto", 3)).toBe(3);
    expect(attributeModifier("nenhum", 18)).toBe(0);
  });
});

describe("evolução do modelo", () => {
  it("campo novo entra vazio nas fichas existentes e a versão sobe", () => {
    const next = addField(template, "s1", { id: "sorte", label: "Sorte", type: "caixa", required: false });
    expect(next.version).toBe(2);
    expect(valuesForTemplate(next, { for: 14 })).toEqual({ for: 14, nome: "", sorte: false });
  });

  it("remover campo some com o valor da ficha", () => {
    const next = removeField(template, "nome");
    expect(valuesForTemplate(next, { for: 14, nome: "Zé" })).toEqual({ for: 14 });
  });

  it("detecta se algum personagem já preencheu o campo", () => {
    expect(fieldHasValues("nome", [{ values: { nome: "" } }, { values: {} }])).toBe(false);
    expect(fieldHasValues("nome", [{ values: { nome: "Zé" } }])).toBe(true);
  });

  it("DEF-06: número 0 digitado conta como valor e bloqueia troca de tipo", () => {
    expect(fieldHasValues("nivel", [{ values: { nivel: 0 } }])).toBe(true);
    expect(fieldHasValues("nivel", [{ values: { nivel: "" } }])).toBe(false);
  });

  it("DEF-03: número e caixa obrigatórios vazios aparecem como faltando", () => {
    const withRequired = addField(addField(template, "s1", { id: "pv", label: "PV", type: "numero", required: true }), "s1", {
      id: "juramento", label: "Fez o juramento", type: "caixa", required: true,
    });
    const blank = valuesForTemplate(withRequired, { for: 12 });
    expect(missingRequiredFields(withRequired, blank).map((f) => f.id)).toEqual(["pv", "juramento"]);
    expect(missingRequiredFields(withRequired, { ...blank, pv: 0, juramento: true })).toEqual([]);
  });

  it("lista campos obrigatórios vazios", () => {
    expect(missingRequiredFields(template, { nome: "x" }).map((f) => f.id)).toEqual(["for"]);
  });
});
