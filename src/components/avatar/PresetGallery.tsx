"use client";

import { PORTRAIT_PRESETS, type PortraitPreset } from "@/domain/portrait";
import { Portrait } from "./Portrait";

type Props = { selectedId?: string; onSelect: (preset: PortraitPreset) => void };

export const PresetGallery = ({ selectedId, onSelect }: Props) => (
  <div className="portrait-gallery">
    {PORTRAIT_PRESETS.map((preset) => (
      <button key={preset.id} type="button" aria-pressed={selectedId === preset.id} onClick={() => onSelect(preset)}>
        <Portrait cfg={preset.cfg} size={104} mode="card" />
        <span>{preset.label}</span>
      </button>
    ))}
  </div>
);
