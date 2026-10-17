import { describe, expect, it } from "vitest";
import { EXAMPLE_TEMPLATES } from "./templates";

describe("modelos prontos", () => {
  it("têm ids únicos de modelo, seção e campo", () => {
    expect(new Set(EXAMPLE_TEMPLATES.map((t) => t.id)).size).toBe(EXAMPLE_TEMPLATES.length);
    for (const { template } of EXAMPLE_TEMPLATES) {
      expect(new Set(template.sections.map((s) => s.id)).size).toBe(template.sections.length);
      const fieldIds = template.sections.flatMap((s) => s.fields.map((f) => f.id));
      expect(new Set(fieldIds).size).toBe(fieldIds.length);
    }
  });

  it("modelo de sistema conhecido mostra fonte e licença (US-37)", () => {
    for (const example of EXAMPLE_TEMPLATES.filter((t) => t.system)) {
      expect(example.source?.license).toBeTruthy();
      expect(example.source?.url).toMatch(/^https:\/\//);
    }
  });

  it("modelo com regra D&D tem atributos para modificar", () => {
    for (const example of EXAMPLE_TEMPLATES.filter((t) => t.modifierRule === "dnd")) {
      const attributes = example.template.sections.flatMap((s) => s.fields).filter((f) => f.type === "atributo");
      expect(attributes.length).toBeGreaterThan(0);
    }
  });
});
