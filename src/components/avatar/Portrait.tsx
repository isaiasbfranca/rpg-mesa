"use client";

import { useId, useMemo } from "react";
import type { PortraitConfig } from "@/domain/portrait";
import { portraitHeight, renderPortrait, type PortraitMode } from "@/domain/portraitSvg";

type Props = { cfg: PortraitConfig; size: number; mode?: PortraitMode; title?: string; className?: string };

/**
 * Retrato ilustrado. O SVG vem de renderPortrait, que só aceita ids do catálogo e cores
 * validadas, por isso pode entrar como HTML.
 */
export const Portrait = ({ cfg, size, mode = "circle", title = "", className }: Props) => {
  const idPrefix = useId();
  const html = useMemo(() => renderPortrait(cfg, { size, mode, title, idPrefix }), [cfg, size, mode, title, idPrefix]);
  return (
    <span
      className={className} style={{ display: "block", lineHeight: 0, width: size, height: portraitHeight(size, mode) }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
