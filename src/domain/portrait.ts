/**
 * Retrato ilustrado (E12, protótipo de UX v0.5): carta 200×240 com rosto realista,
 * gênero, idade e compleição, cenário, aura e moldura, montada em 10 grupos de camadas.
 * Catálogo e arte vêm de portraitArt.js (cópia do protótipo); aqui ficam os tipos e as
 * regras. A configuração guarda só ids do catálogo e cores #rrggbb.
 */
import { BASE, LAYERS, OPT, PAL, PRESETS, RACE_DEF } from "./portraitArt";

export const OPTION_KEYS = [
  "genero", "idade", "corpo", "cenario", "aura", "moldura", "raca", "formato", "olhos", "sobr", "nariz",
  "boca", "marca", "pintura", "maquiagem", "cabelo", "barba", "chifres", "roupa", "chapeu", "rostoAcc", "item",
] as const;
export const COLOR_KEYS = ["corFundo", "pele", "corOlhos", "corPintura", "corCabelo", "corRoupa", "corDetalhe", "corChapeu"] as const;
export type OptionKey = (typeof OPTION_KEYS)[number];
export type ColorKey = (typeof COLOR_KEYS)[number];
export type PortraitKey = OptionKey | ColorKey;
export type PortraitConfig = Record<PortraitKey, string>;
export const PORTRAIT_KEYS: readonly PortraitKey[] = [...OPTION_KEYS, ...COLOR_KEYS];

export const PALETTE_KEYS = ["pele", "cabelo", "olhos", "roupa", "pintura", "fundo"] as const;
export type PaletteKey = (typeof PALETTE_KEYS)[number];

type Named = readonly [id: string, label: string];
const listOf = (table: Readonly<Record<string, readonly Named[]>>, key: string): readonly Named[] => table[key] ?? [];

/** Opções de cada chave: [id, rótulo]. */
export const optionsOf = (key: OptionKey) => listOf(OPT, key);
/** Cores de uma paleta: [rótulo, hex]. */
export const paletteOf = (key: PaletteKey) => listOf(PAL, key);

/** Recorte usado na miniatura de cada opção, para mostrar só a parte que muda. */
export type ThumbView = "full" | "head" | "face" | "torso" | "top";

export type LayerField =
  | { kind: "opcao"; key: OptionKey; label: string; view: ThumbView }
  | { kind: "cor"; key: ColorKey; label: string; palette: PaletteKey };

export type LayerGroup = { id: string; label: string; fields: LayerField[] };

const isOptionKey = (key: string): key is OptionKey => (OPTION_KEYS as readonly string[]).includes(key);
export const isColorKey = (key: string): key is ColorKey => (COLOR_KEYS as readonly string[]).includes(key);
const isPaletteKey = (key: string): key is PaletteKey => (PALETTE_KEYS as readonly string[]).includes(key);
const isThumbView = (view: string): view is ThumbView => ["full", "head", "face", "torso", "top"].includes(view);

/** Os grupos do protótipo, conferidos contra as chaves conhecidas. */
export const LAYER_GROUPS: LayerGroup[] = LAYERS.map(([id, label, fields]) => ({
  id,
  label,
  fields: fields.flatMap(([kind, key, fieldLabel, extra]): LayerField[] => {
    if (kind === "o" && isOptionKey(key) && isThumbView(extra)) return [{ kind: "opcao", key, label: fieldLabel, view: extra }];
    if (kind === "c" && isColorKey(key) && isPaletteKey(extra)) return [{ kind: "cor", key, label: fieldLabel, palette: extra }];
    return [];
  }),
}));

const HEX = /^#[0-9a-f]{6}$/i;
export const isHexColor = (value: unknown): value is string => typeof value === "string" && HEX.test(value);
export const isOption = (key: OptionKey, value: unknown) => optionsOf(key).some(([id]) => id === value);
const isValidValue = (key: PortraitKey, value: unknown) => (isColorKey(key) ? isHexColor(value) : isOption(key, value));

export const BASE_PORTRAIT: PortraitConfig = Object.fromEntries(PORTRAIT_KEYS.map((key) => [key, BASE[key] ?? ""])) as PortraitConfig;

export const optionLabel = (key: OptionKey, id: string) => optionsOf(key).find(([value]) => value === id)?.[1] ?? id;
export const colorLabel = (palette: PaletteKey, hex: string) =>
  paletteOf(palette).find(([, value]) => value.toLowerCase() === hex.toLowerCase())?.[0] ?? "cor própria";

/** Aplica uma escolha; trocar a raça também aplica as sugestões dela. Valor inválido é ignorado. */
export const applyChoice = (cfg: PortraitConfig, key: PortraitKey, value: string): PortraitConfig => {
  if (!isValidValue(key, value)) return cfg;
  const next = { ...cfg, [key]: isColorKey(key) ? value.toUpperCase() : value };
  return key === "raca" ? { ...next, ...RACE_DEF[value] } : next;
};

/** Configuração da miniatura de uma opção: tira chapéu e item quando eles cobririam o detalhe. */
const HIDES_EXTRAS: readonly PortraitKey[] = ["genero", "idade", "raca", "formato", "olhos", "sobr", "nariz", "boca", "marca", "pintura", "maquiagem", "cabelo", "barba", "chifres", "rostoAcc"];
export const thumbnailConfig = (cfg: PortraitConfig, key: OptionKey, value: string): PortraitConfig => {
  const next = applyChoice(cfg, key, value);
  return HIDES_EXTRAS.includes(key) ? { ...next, chapeu: "nenhum", item: "nenhum" } : next;
};

const pick = <T>(list: readonly T[], random: () => number): T => {
  const item = list[Math.floor(random() * list.length)];
  if (item === undefined) throw new Error("Lista vazia");
  return item;
};

const randomValue = (field: LayerField, random: () => number) =>
  field.kind === "cor" ? pick(paletteOf(field.palette), random)[1] : pick(optionsOf(field.key), random)[0];

/** Sorteia tudo; extras chamativos aparecem só às vezes, e barba e maquiagem seguem o gênero na maioria das vezes. */
export const randomPortrait = (random: () => number = Math.random): PortraitConfig => {
  const cfg = { ...BASE_PORTRAIT };
  for (const group of LAYER_GROUPS) for (const field of group.fields) cfg[field.key] = randomValue(field, random);
  if (random() < 0.6) cfg.chifres = "nenhum";
  if (random() < 0.5) cfg.aura = "nenhuma";
  if (random() < 0.5) cfg.marca = "nenhuma";
  if (random() < 0.6) cfg.pintura = "nenhuma";
  if (cfg.cenario === "liso") cfg.cenario = "floresta";
  if (cfg.genero === "fem" && random() < 0.85) cfg.barba = "nenhuma";
  if (cfg.genero !== "fem" && random() < 0.7) cfg.maquiagem = "nenhuma";
  if (random() < 0.5) cfg.maquiagem = "nenhuma";
  if (random() < 0.6) cfg.rostoAcc = "nenhum";
  return cfg;
};

/** Sorteia só os campos de um grupo (botão "Sortear <camada>"). */
export const randomizeGroup = (cfg: PortraitConfig, groupId: string, random: () => number = Math.random): PortraitConfig => {
  const group = LAYER_GROUPS.find((g) => g.id === groupId);
  if (!group) return cfg;
  const next = { ...cfg };
  for (const field of group.fields) next[field.key] = randomValue(field, random);
  return next;
};

/** Mantém só valores conhecidos; o resto volta ao padrão e é apontado (CT-AVA-10/11). */
export const normalizePortrait = (saved: unknown): { cfg: PortraitConfig; stale: PortraitKey[] } => {
  const source = (saved && typeof saved === "object" ? saved : {}) as Record<string, unknown>;
  const cfg = { ...BASE_PORTRAIT };
  const stale: PortraitKey[] = [];
  for (const key of PORTRAIT_KEYS) {
    const value = source[key];
    if (value === undefined) continue;
    if (isValidValue(key, value)) cfg[key] = value as string;
    else stale.push(key);
  }
  return { cfg, stale };
};

/** Nome em texto do campo, para avisos e leitores de tela. */
export const fieldLabel = (key: PortraitKey) =>
  LAYER_GROUPS.flatMap((g) => g.fields).find((f) => f.key === key)?.label ?? key;

/** Descrição para leitores de tela (alt do retrato). */
export const describePortrait = (cfg: PortraitConfig): string => {
  const lower = (key: OptionKey) => optionLabel(key, cfg[key]).toLowerCase();
  const parts = [
    `${optionLabel("raca", cfg.raca)}, ${lower("genero")}, ${lower("idade")}, ${lower("corpo")}`,
    `cabelo ${lower("cabelo")}`,
    cfg.barba !== "nenhuma" && `barba ${lower("barba")}`,
    `olhos ${lower("olhos")}`,
    `expressão ${lower("boca")}`,
    cfg.maquiagem !== "nenhuma" && `maquiagem ${lower("maquiagem")}`,
    cfg.rostoAcc !== "nenhum" && lower("rostoAcc"),
    `roupa ${lower("roupa")}`,
    cfg.chapeu !== "nenhum" && lower("chapeu"),
    cfg.item !== "nenhum" && `segurando ${lower("item")}`,
    `cenário ${lower("cenario")}`,
  ];
  return parts.filter(Boolean).join(", ");
};

// Migração do formato v1 (11 camadas com ids de cor) para o retrato v2.
const V1_COLORS: Record<string, string> = {
  "pele:porcelana": "#F6DCC6", "pele:areia": "#E2A97F", "pele:oliva": "#C48E5C", "pele:canela": "#A36B42", "pele:ebano": "#4E2E1C", "pele:musgo": "#7FA05A", "pele:cinza-azulado": "#7FA7D6", "pele:carmim": "#B54A3C",
  "cabelo:preto": "#1E1A18", "cabelo:castanho": "#6B4428", "cabelo:ruivo": "#A8432A", "cabelo:loiro": "#C99A48", "cabelo:prata": "#AEB6BF", "cabelo:azul": "#2E4C9A", "cabelo:verde": "#3E7D4F", "cabelo:branco": "#EEECE6",
  "olhos:castanho": "#5A3A22", "olhos:azul": "#3D74C4", "olhos:verde": "#3E8A4F", "olhos:ambar": "#C88A1E", "olhos:violeta": "#8A4FC4", "olhos:vermelho": "#C4322A", "olhos:cinza": "#7D8A96", "olhos:dourado": "#E2B24F",
  "tecido:vinho": "#7A2B33", "tecido:floresta": "#2E4F38", "tecido:anil": "#283A66", "tecido:ocre": "#B08A2E", "tecido:carvao": "#3E4650", "tecido:linho": "#E6DCC8", "tecido:ferro": "#8C96A0", "tecido:ouro": "#B08A2E",
  "fundo:feltro": "#1F5C4A", "fundo:noite": "#22304A", "fundo:pergaminho": "#D9C9A3", "fundo:brasa": "#7A3B22", "fundo:nevoa": "#A7B5B0", "fundo:ametista": "#8E7FB0", "fundo:mar": "#1F5F73", "fundo:areia": "#C2A578",
};
const V1_OPTIONS: Record<string, Record<string, Partial<PortraitConfig>>> = {
  fundo: { liso: { cenario: "liso" }, brilho: { cenario: "arcano" }, estrelas: { cenario: "noite" }, montanhas: { cenario: "neve" } },
  especie: { humano: { raca: "humano" }, elfo: { raca: "elfo" }, orc: { raca: "orc", boca: "presas" }, chifres: { raca: "tiefling", chifres: "curvos" } },
  olhos: { redondos: { olhos: "redondos" }, severos: { olhos: "serios" }, fechados: { olhos: "fechados" }, brilhantes: { olhos: "brilho" } },
  sobrancelhas: { retas: { sobr: "retas" }, arqueadas: { sobr: "arqueadas" }, franzidas: { sobr: "bravas" }, nenhuma: { sobr: "finas" } },
  boca: { sorriso: { boca: "sorriso" }, neutra: { boca: "neutra" }, seria: { boca: "seria" }, aberta: { boca: "surpresa" } },
  cabelo: { curto: { cabelo: "curto" }, longo: { cabelo: "liso" }, rabo: { cabelo: "rabo" }, tranca: { cabelo: "trancas" }, moicano: { cabelo: "moicano" }, careca: { cabelo: "careca" } },
  barba: { nenhuma: { barba: "nenhuma" }, bigode: { barba: "bigode" }, curta: { barba: "curta" }, longa: { barba: "longa" } },
  roupa: { tunica: { roupa: "tunica" }, couro: { roupa: "couro" }, manto: { roupa: "manto" }, armadura: { roupa: "placas" } },
  acessorio: { nenhum: { chapeu: "nenhum" }, capuz: { chapeu: "capuz" }, chapeu: { chapeu: "mago" }, elmo: { chapeu: "elmo" }, coroa: { chapeu: "coroa" }, tiara: { chapeu: "tiara" } },
  item: { nenhum: { item: "nenhum" }, espada: { item: "espada" }, adaga: { item: "adaga" }, cajado: { item: "cajado" }, alaude: { item: "alaude" }, escudo: { item: "escudo" } },
  moldura: { nenhuma: { moldura: "nenhuma" }, simples: { moldura: "prata" }, dourada: { moldura: "ouro" }, runas: { moldura: "runas" } },
};
const V1_COLOR_TARGET: Record<string, [palette: string, key: ColorKey]> = {
  fundo: ["fundo", "corFundo"], especie: ["pele", "pele"], olhos: ["olhos", "corOlhos"], cabelo: ["cabelo", "corCabelo"],
  roupa: ["tecido", "corRoupa"], acessorio: ["tecido", "corChapeu"],
};

/** Converte camadas salvas pela primeira versão do criador; o que não tiver par fica no padrão. */
export const migrateV1Layers = (layers: unknown): PortraitConfig => {
  const source = (layers && typeof layers === "object" ? layers : {}) as Record<string, { option?: unknown; color?: unknown } | undefined>;
  let cfg: PortraitConfig = { ...BASE_PORTRAIT, genero: "neutro", sobr: "retas", cabelo: "curto", moldura: "prata" };
  for (const [layer, map] of Object.entries(V1_OPTIONS)) {
    const option = source[layer]?.option;
    if (typeof option === "string" && map[option]) cfg = { ...cfg, ...map[option] };
  }
  for (const [layer, [palette, key]] of Object.entries(V1_COLOR_TARGET)) {
    const hex = V1_COLORS[`${palette}:${String(source[layer]?.color)}`];
    if (hex) cfg[key] = hex;
  }
  // A primeira versão não tinha gênero: quem escolheu barba vira masculino, o resto andrógino.
  return cfg.barba === "nenhuma" ? cfg : { ...cfg, genero: "masc" };
};

export type PortraitPreset = { id: string; label: string; cfg: PortraitConfig };

const slug = (label: string) => label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "-");

/** Galeria de 16 arquétipos (E12, caminho 2), os mesmos do protótipo de UX v0.5. */
export const PORTRAIT_PRESETS: PortraitPreset[] = PRESETS.map(([label, changes]) => ({
  id: slug(label),
  label,
  cfg: normalizePortrait({ ...BASE_PORTRAIT, ...changes }).cfg,
}));
