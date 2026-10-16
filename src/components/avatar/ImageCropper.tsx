"use client";

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type PointerEvent } from "react";
import {
  AVATAR_OUTPUT_SIZE,
  AVATAR_THUMB_SIZE,
  AvatarUploadError,
  clampCrop,
  cropSourceRect,
  validateUpload,
  validateUploadContent,
  type CropShape,
  type CropState,
} from "@/domain/avatar";

const FRAME = 240;
const KEY_STEP = 10;
const INITIAL_CROP: CropState = { zoom: 1, offsetX: 0, offsetY: 0 };

type Loaded = { url: string; image: HTMLImageElement };

type Props = { onCrop: (image: { dataUrl: string; thumbUrl: string }, shape: CropShape) => void; onCancel: () => void };

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new AvatarUploadError("Não foi possível abrir esta imagem."));
    image.src = url;
  });

/** Envio de imagem com recorte quadrado ou circular, zoom e arraste (mouse, toque ou setas). */
export const ImageCropper = ({ onCrop, onCancel }: Props) => {
  const [loaded, setLoaded] = useState<Loaded>();
  const [crop, setCrop] = useState<CropState>(INITIAL_CROP);
  const [shape, setShape] = useState<CropShape>("circulo");
  const [error, setError] = useState<string>();
  const drag = useRef<{ x: number; y: number; start: CropState }>(undefined);

  useEffect(() => () => {
    if (loaded) URL.revokeObjectURL(loaded.url);
  }, [loaded]);

  const size = loaded ? { width: loaded.image.naturalWidth, height: loaded.image.naturalHeight } : { width: 1, height: 1 };
  const update = (next: CropState) => setCrop(clampCrop(next, size, FRAME));

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      validateUpload(file);
      validateUploadContent(new Uint8Array(await file.slice(0, 12).arrayBuffer()));
      const url = URL.createObjectURL(file);
      setLoaded({ url, image: await loadImage(url) });
      setCrop(INITIAL_CROP);
      setError(undefined);
    } catch (cause) {
      if (!(cause instanceof AvatarUploadError)) throw cause;
      event.target.value = "";
      setError(cause.message);
    }
  };

  const cancel = () => {
    setLoaded(undefined);
    setCrop(INITIAL_CROP);
    onCancel();
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, start: crop };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start) return;
    update({ ...start.start, offsetX: start.start.offsetX + event.clientX - start.x, offsetY: start.start.offsetY + event.clientY - start.y });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, [number, number]> = { ArrowLeft: [-KEY_STEP, 0], ArrowRight: [KEY_STEP, 0], ArrowUp: [0, -KEY_STEP], ArrowDown: [0, KEY_STEP] };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    update({ ...crop, offsetX: crop.offsetX + move[0], offsetY: crop.offsetY + move[1] });
  };

  /** Redesenha o recorte no tamanho pedido; o novo arquivo sai sem EXIF. */
  const render = (image: HTMLImageElement, side: number, quality: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = side;
    canvas.height = side;
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    const source = cropSourceRect(crop, size, FRAME);
    context.drawImage(image, source.x, source.y, source.size, source.size, 0, 0, side, side);
    const webp = canvas.toDataURL("image/webp", quality);
    return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
  };

  const confirm = () => {
    if (!loaded) return;
    const dataUrl = render(loaded.image, AVATAR_OUTPUT_SIZE, 0.85);
    const thumbUrl = render(loaded.image, AVATAR_THUMB_SIZE, 0.8);
    if (!dataUrl || !thumbUrl) return setError("Seu navegador não conseguiu recortar a imagem.");
    onCrop({ dataUrl, thumbUrl }, shape);
  };

  const scale = (FRAME / Math.min(size.width, size.height)) * crop.zoom;

  return (
    <div className="stack">
      <label>
        Imagem (JPG, PNG ou WebP, até 5 MB)
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      {loaded && (
        <>
          <div
            className={`crop-frame ${shape}`} tabIndex={0} role="group"
            aria-label="Área de recorte. Arraste ou use as setas para posicionar."
            onPointerDown={onPointerDown} onPointerMove={onPointerMove}
            onPointerUp={() => (drag.current = undefined)} onKeyDown={onKeyDown}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- pré-visualização local do arquivo escolhido */}
            <img
              src={loaded.url} alt="" draggable={false}
              style={{
                width: size.width * scale, height: size.height * scale,
                transform: `translate(calc(-50% + ${crop.offsetX}px), calc(-50% + ${crop.offsetY}px))`,
              }}
            />
          </div>
          <label>
            Zoom
            <input type="range" min={1} max={4} step={0.05} value={crop.zoom} onChange={(e) => update({ ...crop, zoom: Number(e.target.value) })} />
          </label>
          <div className="row" role="radiogroup" aria-label="Formato do recorte">
            {(["circulo", "quadrado"] as const).map((option) => (
              <label key={option} className="choice">
                <input type="radio" name="formato" checked={shape === option} onChange={() => setShape(option)} />
                {option === "circulo" ? "Circular" : "Quadrado"}
              </label>
            ))}
          </div>
          <div className="row">
            <button type="button" onClick={confirm}>Usar este recorte</button>
            <button type="button" className="secondary" onClick={cancel}>Cancelar</button>
          </div>
        </>
      )}
    </div>
  );
};
