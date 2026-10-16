import { describe, expect, it } from "vitest";
import {
  applyChoice,
  BASE_PORTRAIT,
  COLOR_KEYS,
  colorLabel,
  describePortrait,
  fieldLabel,
  isOption,
  LAYER_GROUPS,
  migrateV1Layers,
  normalizePortrait,
  OPTION_KEYS,
  optionsOf,
  paletteOf,
  PALETTE_KEYS,
  PORTRAIT_KEYS,
  PORTRAIT_PRESETS,
  randomizeGroup,
  randomPortrait,
  thumbnailConfig,
  type PortraitConfig,
} from "./portrait";
import { BASE } from "./portraitArt";
import { portraitHeight, renderPortrait } from "./portraitSvg";

const isValid = (cfg: PortraitConfig) => normalizePortrait(cfg).stale.length === 0 && PORTRAIT_KEYS.every((k) => cfg[k] !== "");

describe("catálogo do UX v0.5", () => {
  it("as 30 chaves do protótipo batem com os tipos do app", () => {
    expect(Object.keys(BASE).sort()).toEqual([...PORTRAIT_KEYS].sort());
    expect(PORTRAIT_KEYS).toHaveLength(30);
    expect(isValid(BASE_PORTRAIT)).toBe(true);
  });

  it("todo campo do protótipo virou campo tipado, em 10 grupos", () => {
    expect(LAYER_GROUPS.map((g) => g.id)).toEqual(["corpo", "raca", "rosto", "cabelo", "marcas", "chifres", "roupa", "chapeu", "item", "cenario"]);
    const keys = LAYER_GROUPS.flatMap((g) => g.fields.map((f) => f.key));
    expect(keys.sort()).toEqual([...PORTRAIT_KEYS].sort());
  });

  it("CT-AVA-03: 3 gêneros, 18 penteados, ≥ 4 opções nas camadas e ≥ 6 cores por paleta", () => {
    expect(optionsOf("genero").map(([id]) => id)).toEqual(["fem", "masc", "neutro"]);
    expect(optionsOf("cabelo")).toHaveLength(18);
    for (const key of OPTION_KEYS.filter((k) => k !== "genero" && k !== "corpo")) expect(optionsOf(key).length, key).toBeGreaterThanOrEqual(4);
    for (const key of PALETTE_KEYS) expect(paletteOf(key).length, key).toBeGreaterThanOrEqual(6);
    for (const key of ["barba", "chapeu", "item", "moldura", "maquiagem", "rostoAcc"] as const)
      expect(optionsOf(key).some(([id]) => id.startsWith("nenhum")), key).toBe(true);
  });

  it("galeria com 16 arquétipos válidos, de todos os gêneros", () => {
    expect(PORTRAIT_PRESETS).toHaveLength(16);
    expect(new Set(PORTRAIT_PRESETS.map((p) => p.id)).size).toBe(16);
    for (const preset of PORTRAIT_PRESETS) expect(isValid(preset.cfg), preset.id).toBe(true);
    expect(new Set(PORTRAIT_PRESETS.map((p) => p.cfg.genero))).toEqual(new Set(["fem", "masc", "neutro"]));
  });
});

describe("escolhas", () => {
  it("trocar a raça aplica as sugestões dela", () => {
    const orc = applyChoice(BASE_PORTRAIT, "raca", "orc");
    expect(orc).toMatchObject({ raca: "orc", pele: "#7FA05A", boca: "presas" });
  });

  it("trocar o gênero não apaga cabelo, barba nem maquiagem", () => {
    const cfg = { ...BASE_PORTRAIT, cabelo: "dreads", barba: "cheia", maquiagem: "dourada" };
    expect(applyChoice(cfg, "genero", "fem")).toMatchObject({ genero: "fem", cabelo: "dreads", barba: "cheia", maquiagem: "dourada" });
  });

  it("aceita cor própria em hex e recusa o resto", () => {
    expect(applyChoice(BASE_PORTRAIT, "corCabelo", "#12ab9f").corCabelo).toBe("#12AB9F");
    expect(applyChoice(BASE_PORTRAIT, "corCabelo", "red")).toBe(BASE_PORTRAIT);
    expect(applyChoice(BASE_PORTRAIT, "cabelo", "inventado")).toBe(BASE_PORTRAIT);
    expect(colorLabel("cabelo", "#12AB9F")).toBe("cor própria");
    expect(colorLabel("cabelo", "#a8432a")).toBe("Ruivo");
  });

  it("miniatura de penteado tira chapéu e item; a de cenário mantém", () => {
    const cfg = { ...BASE_PORTRAIT, chapeu: "elmo", item: "espada" };
    expect(thumbnailConfig(cfg, "cabelo", "coque")).toMatchObject({ cabelo: "coque", chapeu: "nenhum", item: "nenhum" });
    expect(thumbnailConfig(cfg, "cenario", "neve")).toMatchObject({ chapeu: "elmo", item: "espada" });
  });

  it("CT-AVA-07: sorteio sempre gera um retrato válido", () => {
    for (let i = 0; i < 500; i++) expect(isValid(randomPortrait())).toBe(true);
    expect(isValid(randomPortrait(() => 0.9999))).toBe(true);
    expect(randomPortrait(() => 0).cenario).toBe("floresta");
  });

  it("sortear um grupo só mexe nos campos dele", () => {
    const next = randomizeGroup(BASE_PORTRAIT, "cabelo", () => 0.99);
    const changed = PORTRAIT_KEYS.filter((k) => next[k] !== BASE_PORTRAIT[k]);
    expect(changed.every((k) => ["cabelo", "corCabelo", "barba"].includes(k))).toBe(true);
    expect(changed.length).toBeGreaterThan(0);
    expect(randomizeGroup(BASE_PORTRAIT, "nao-existe")).toBe(BASE_PORTRAIT);
  });
});

describe("dados salvos", () => {
  it("CT-AVA-10/11: valor desconhecido ou texto injetado volta ao padrão e é apontado", () => {
    const { cfg, stale } = normalizePortrait({ cabelo: "<script>alert(1)</script>", pele: '" onload="alert(1)', olhos: "felinos", extra: "x" });
    expect(stale).toEqual(["cabelo", "pele"]);
    expect(cfg.cabelo).toBe(BASE_PORTRAIT.cabelo);
    expect(cfg.olhos).toBe("felinos");
    expect(normalizePortrait(null).cfg).toEqual(BASE_PORTRAIT);
    expect(fieldLabel("pele")).toBe("Tom de pele");
  });

  it("migra o criador v1: opções, cores e gênero pela barba", () => {
    const cfg = migrateV1Layers({
      fundo: { option: "estrelas", color: "noite" }, especie: { option: "chifres", color: "carmim" },
      olhos: { option: "severos", color: "verde" }, roupa: { option: "armadura", color: "ferro" },
      acessorio: { option: "chapeu", color: "anil" }, moldura: { option: "dourada" }, item: { option: "removido" },
    });
    expect(cfg).toMatchObject({
      cenario: "noite", corFundo: "#22304A", raca: "tiefling", chifres: "curvos", pele: "#B54A3C",
      olhos: "serios", corOlhos: "#3E8A4F", roupa: "placas", corRoupa: "#8C96A0", chapeu: "mago", corChapeu: "#283A66",
      moldura: "ouro", item: "nenhum", genero: "neutro",
    });
    expect(isValid(cfg)).toBe(true);
    expect(isValid(migrateV1Layers("lixo"))).toBe(true);
  });
});

describe("desenho", () => {
  it("todas as opções de todas as chaves desenham sem undefined nem NaN", () => {
    for (const key of OPTION_KEYS)
      for (const [id] of optionsOf(key)) {
        const svg = renderPortrait({ ...BASE_PORTRAIT, [key]: id }, { size: 96, mode: "card", idPrefix: "t" });
        expect(svg, `${key}=${id}`).not.toMatch(/undefined|NaN/);
        expect(isOption(key, id)).toBe(true);
      }
  });

  it("cores próprias entram, e configuração inválida não chega ao SVG", () => {
    // Cor de fundo só aparece no cenário liso; pintura só com pintura escolhida.
    const base = { ...BASE_PORTRAIT, cenario: "liso", pintura: "listras", chapeu: "capuz" };
    const plain = renderPortrait(base, { size: 40, mode: "circle", idPrefix: "c" });
    for (const key of COLOR_KEYS) expect(renderPortrait({ ...base, [key]: "#123456" }, { size: 40, mode: "circle", idPrefix: "c" }), key).not.toBe(plain);
    const svg = renderPortrait({ ...BASE_PORTRAIT, corCabelo: '"/><script>alert(1)</script>' }, { size: 40, mode: "circle", idPrefix: ":r1:" });
    expect(svg).not.toContain("<script");
    expect(svg).not.toContain(":r1:");
  });

  it("com título vira imagem nomeada (título escapado); sem título é decorativo", () => {
    const named = renderPortrait(BASE_PORTRAIT, { size: 200, mode: "card", title: 'Avatar de "Bia" <3', idPrefix: "a" });
    expect(named).toContain('role="img" aria-label="Avatar de &quot;Bia&quot; &lt;3"');
    expect(renderPortrait(BASE_PORTRAIT, { size: 40, mode: "head", idPrefix: "b" })).toContain('aria-hidden="true"');
  });

  it("altura por modo", () => {
    expect(portraitHeight(100, "card")).toBe(120);
    expect(portraitHeight(100, "torso")).toBe(52);
    expect(portraitHeight(100, "circle")).toBe(100);
  });

  it("descreve o retrato em texto", () => {
    const text = describePortrait({ ...BASE_PORTRAIT, genero: "masc", barba: "cheia", item: "espada", rostoAcc: "oculos", maquiagem: "natural", chapeu: "elmo" });
    expect(text).toContain("Humano, masculino, adulto, médio");
    expect(text).toContain("barba cheia");
    expect(text).toContain("segurando espada");
    expect(text).toContain("óculos");
  });
});
