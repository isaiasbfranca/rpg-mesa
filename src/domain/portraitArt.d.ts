/** Tipos do catálogo e do desenho copiados do protótipo de UX (portraitArt.js). */
type Pair = readonly [string, string];
/** [tipo ("o" opção, "c" cor), chave, rótulo, recorte da miniatura ou paleta] */
type LayerFieldTuple = readonly ["o" | "c", string, string, string];

export declare const PAL: Readonly<Record<string, readonly Pair[]>>;
export declare const OPT: Readonly<Record<string, readonly Pair[]>>;
export declare const VB: Readonly<Record<string, string>>;
export declare const LAYERS: readonly (readonly [id: string, label: string, fields: readonly LayerFieldTuple[]])[];
export declare const RACE_DEF: Readonly<Record<string, Readonly<Record<string, string>>>>;
export declare const BASE: Readonly<Record<string, string>>;
export declare const PRESETS: readonly (readonly [label: string, changes: Readonly<Record<string, string>>])[];
export declare function avatarSvg(cfg: Record<string, string>, size: number, title: string, mode: string, key: string): string;
