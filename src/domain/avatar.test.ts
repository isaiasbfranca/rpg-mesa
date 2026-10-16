import { describe, expect, it } from "vitest";
import {
  AvatarUploadError,
  clampCrop,
  cropSourceRect,
  detectImageType,
  portraitOf,
  UPLOAD_MAX_BYTES,
  validateUpload,
  validateUploadContent,
} from "./avatar";
import { BASE_PORTRAIT } from "./portrait";

describe("retrato salvo", () => {
  it("lê o formato atual e aponta valores desconhecidos", () => {
    const result = portraitOf({ kind: "camadas", cfg: { ...BASE_PORTRAIT, cabelo: "<script>" } });
    expect(result.migrated).toBe(false);
    expect(result.stale).toEqual(["cabelo"]);
    expect(result.cfg.cabelo).toBe(BASE_PORTRAIT.cabelo);
  });

  it("converte o formato da primeira versão (11 camadas)", () => {
    const result = portraitOf({ kind: "camadas", layers: { cabelo: { option: "longo", color: "ruivo" }, barba: { option: "curta" } } });
    expect(result.migrated).toBe(true);
    expect(result.cfg).toMatchObject({ cabelo: "liso", corCabelo: "#A8432A", barba: "curta", genero: "masc" });
  });
});

describe("upload", () => {
  it("aceita JPG, PNG e WebP até 5 MB", () => {
    expect(() => validateUpload({ type: "image/png", size: UPLOAD_MAX_BYTES })).not.toThrow();
    expect(() => validateUpload({ type: "image/webp", size: 10 })).not.toThrow();
  });

  it("recusa outro formato ou arquivo grande", () => {
    expect(() => validateUpload({ type: "image/gif", size: 10 })).toThrow(AvatarUploadError);
    expect(() => validateUpload({ type: "image/jpeg", size: UPLOAD_MAX_BYTES + 1 })).toThrow(/5 MB/);
  });
});

describe("CT-AVA-22: tipo real do arquivo", () => {
  const bytes = (...values: number[]) => new Uint8Array(values);
  const ascii = (text: string) => new TextEncoder().encode(text);

  it("reconhece JPG, PNG e WebP pelos primeiros bytes", () => {
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("image/png");
    expect(detectImageType(ascii("RIFF\0\0\0\0WEBP"))).toBe("image/webp");
  });

  it("recusa texto, HTML, SVG, GIF e PDF mesmo com extensão de imagem", () => {
    for (const fake of ["<html><script>", "<svg xmlns=", "GIF89a", "%PDF-1.7", "RIFF\0\0\0\0WAVE"])
      expect(() => validateUploadContent(ascii(fake)), fake).toThrow(AvatarUploadError);
  });
});

describe("recorte", () => {
  const landscape = { width: 400, height: 200 };

  it("no zoom 1 a imagem cobre o quadro e só anda no eixo maior", () => {
    expect(clampCrop({ zoom: 1, offsetX: 999, offsetY: 999 }, landscape, 100)).toEqual({ zoom: 1, offsetX: 50, offsetY: 0 });
  });

  it("limita o zoom entre 1 e 4", () => {
    expect(clampCrop({ zoom: 0.2, offsetX: 0, offsetY: 0 }, landscape, 100).zoom).toBe(1);
    expect(clampCrop({ zoom: 9, offsetX: 0, offsetY: 0 }, landscape, 100).zoom).toBe(4);
  });

  it("calcula o quadrado de origem centralizado e deslocado", () => {
    expect(cropSourceRect({ zoom: 1, offsetX: 0, offsetY: 0 }, landscape, 100)).toEqual({ x: 100, y: 0, size: 200 });
    expect(cropSourceRect({ zoom: 2, offsetX: 0, offsetY: 0 }, landscape, 100)).toEqual({ x: 150, y: 50, size: 100 });
    expect(cropSourceRect({ zoom: 1, offsetX: 50, offsetY: 0 }, landscape, 100)).toEqual({ x: 0, y: 0, size: 200 });
  });
});
