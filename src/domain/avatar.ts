/** Aparência do personagem (E12): retrato ilustrado reeditável ou imagem enviada. */

import { migrateV1Layers, normalizePortrait, type PortraitConfig, type PortraitKey } from "./portrait";

export type CropShape = "circulo" | "quadrado";

export type Avatar =
  | { kind: "camadas"; cfg: PortraitConfig; presetId?: string }
  | { kind: "imagem"; dataUrl: string; shape: CropShape; /** Miniatura para listas e rolagens (RNF-14: ≤ 30 KB). */ thumbUrl?: string };

/** Formato salvo pela primeira versão do criador (11 camadas), antes do retrato ilustrado. */
type LegacyLayersAvatar = { kind: "camadas"; layers: unknown; presetId?: string };

/**
 * Lê um retrato salvo em qualquer versão: o formato antigo é convertido e valores
 * desconhecidos voltam ao padrão, listados em `stale` (CT-AVA-10).
 */
export const portraitOf = (avatar: Avatar | LegacyLayersAvatar): { cfg: PortraitConfig; stale: PortraitKey[]; migrated: boolean } => {
  if ("cfg" in avatar && avatar.cfg) return { ...normalizePortrait(avatar.cfg), migrated: false };
  return { cfg: migrateV1Layers("layers" in avatar ? avatar.layers : undefined), stale: [], migrated: true };
};

// Upload (E12, caminho 3)
export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
/** Lado do quadrado salvo depois do recorte; pequeno o bastante para caber no armazenamento local. */
export const AVATAR_OUTPUT_SIZE = 512;
export const AVATAR_THUMB_SIZE = 96;
/** Até este tamanho de exibição a miniatura basta. */
export const THUMB_MAX_DISPLAY = 96;

export class AvatarUploadError extends Error {}

/** Tipo real pelos primeiros bytes do arquivo, sem confiar na extensão (CT-AVA-22). */
export const detectImageType = (bytes: Uint8Array): (typeof UPLOAD_TYPES)[number] | undefined => {
  const startsWith = (signature: number[], offset = 0) => signature.every((b, i) => bytes[offset + i] === b);
  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  return undefined;
};

export const validateUploadContent = (header: Uint8Array) => {
  if (!detectImageType(header)) throw new AvatarUploadError("Este arquivo não é uma imagem JPG, PNG ou WebP de verdade.");
};

export const validateUpload = (file: { type: string; size: number }) => {
  if (!(UPLOAD_TYPES as readonly string[]).includes(file.type))
    throw new AvatarUploadError("Use uma imagem JPG, PNG ou WebP.");
  if (file.size > UPLOAD_MAX_BYTES) throw new AvatarUploadError("A imagem passa de 5 MB. Escolha uma menor.");
};

export type CropState = { zoom: number; offsetX: number; offsetY: number };

/**
 * Recorte quadrado: a imagem cobre o quadro no zoom 1 (lado menor = quadro) e o
 * deslocamento é limitado para nunca mostrar área vazia. Valores em pixels do quadro.
 */
export const clampCrop = (
  crop: CropState,
  image: { width: number; height: number },
  frame: number,
): CropState => {
  const zoom = Math.min(4, Math.max(1, crop.zoom));
  const scale = (frame / Math.min(image.width, image.height)) * zoom;
  const maxX = Math.max(0, (image.width * scale - frame) / 2);
  const maxY = Math.max(0, (image.height * scale - frame) / 2);
  const clamp = (value: number, max: number) => Math.min(max, Math.max(-max, value));
  return { zoom, offsetX: clamp(crop.offsetX, maxX), offsetY: clamp(crop.offsetY, maxY) };
};

/** Retângulo da imagem original que cai dentro do quadro, para desenhar no canvas de saída. */
export const cropSourceRect = (
  crop: CropState,
  image: { width: number; height: number },
  frame: number,
) => {
  const { zoom, offsetX, offsetY } = clampCrop(crop, image, frame);
  const scale = (frame / Math.min(image.width, image.height)) * zoom;
  const size = frame / scale;
  return {
    x: image.width / 2 - offsetX / scale - size / 2,
    y: image.height / 2 - offsetY / scale - size / 2,
    size,
  };
};
