import { portraitOf, THUMB_MAX_DISPLAY, type Avatar } from "@/domain/avatar";
import { describePortrait } from "@/domain/portrait";
import type { PortraitMode } from "@/domain/portraitSvg";
import { Portrait } from "./Portrait";

type Props = {
  avatar?: Avatar;
  name: string;
  size?: number;
  /** Inclui as escolhas do retrato no nome acessível (no criador, para leitor de tela). */
  describe?: boolean;
  /** "card" mostra a carta inteira com moldura; listas usam o recorte redondo. */
  mode?: Extract<PortraitMode, "card" | "circle">;
};

/** Iniciais das duas primeiras palavras, contando emoji e acentos como um caractere só. */
export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0]?.toLocaleUpperCase("pt-BR") ?? "")
    .join("") || "?";

/** O mesmo avatar na ficha, na lista e nas rolagens; sem avatar, mostra as iniciais. */
export const CharacterAvatar = ({ avatar, name, size = 48, describe = false, mode = "circle" }: Props) => {
  const height = mode === "card" ? Math.round(size * 1.2) : size;
  const radius = mode === "card" ? 14 : size / 4;
  const style = { width: size, height, borderRadius: radius, overflow: "hidden", flexShrink: 0 } as const;
  const label = `Avatar de ${name}`;

  if (!avatar)
    return (
      <span role="img" aria-label={`${label} (sem retrato)`} className="avatar-placeholder" style={{ ...style, fontSize: size / 2.6 }}>
        {initialsOf(name)}
      </span>
    );

  if (avatar.kind === "imagem")
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data URL local, sem otimização do Next
      <img
        src={size <= THUMB_MAX_DISPLAY && avatar.thumbUrl ? avatar.thumbUrl : avatar.dataUrl} alt={label} width={size} height={height}
        style={{ ...style, borderRadius: mode === "circle" && avatar.shape === "circulo" ? "50%" : radius, objectFit: "cover" }}
      />
    );

  const { cfg } = portraitOf(avatar);
  return (
    <span style={{ flexShrink: 0 }}>
      <Portrait cfg={cfg} size={size} mode={mode} title={describe ? `${label}. ${describePortrait(cfg)}` : label} />
    </span>
  );
};
