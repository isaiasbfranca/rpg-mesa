import { normalizePortrait, type PortraitConfig } from "./portrait";
import { avatarSvg } from "./portraitArt";

/** card: carta 200×240 com moldura; circle: recorte redondo para listas; os outros são miniaturas. */
export type PortraitMode = "card" | "circle" | "head" | "face" | "torso" | "top";

export type PortraitRenderOptions = {
  size: number;
  mode: PortraitMode;
  /** Nome acessível; vazio deixa o SVG decorativo (aria-hidden). */
  title?: string;
  /** Prefixo dos ids de gradiente, único por retrato na página. */
  idPrefix: string;
};

/** Altura em pixels para uma largura, conforme o modo. */
export const portraitHeight = (size: number, mode: PortraitMode) =>
  mode === "card" ? Math.round(size * 1.2) : mode === "torso" ? Math.round(size * 0.52) : size;

/**
 * Gera o SVG como texto. A configuração passa de novo por normalizePortrait, então só
 * ids do catálogo e cores #rrggbb chegam ao desenho (CT-AVA-11).
 */
export const renderPortrait = (cfg: Partial<PortraitConfig>, { size, mode, title = "", idPrefix }: PortraitRenderOptions): string =>
  avatarSvg(normalizePortrait(cfg).cfg, size, title, mode, idPrefix.replace(/[^A-Za-z0-9_-]/g, ""));
