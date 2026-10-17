const SHAPES = [4, 6, 8, 10, 12, 20, 100];

type Props = {
  sides: number;
  /** Com valor, é um dado lançado (pergaminho); sem valor, é o ícone do botão. */
  value?: number;
  tone?: "crit" | "fail";
  rotate?: number;
};

/** Dado desenhado só com CSS (clip-path); dados fora do catálogo usam o d6. */
export const Die = ({ sides, value, tone, rotate = 0 }: Props) => {
  const shape = SHAPES.includes(sides) ? sides : 6;
  const thrown = value !== undefined;
  const classes = ["die", `die-${shape}`, thrown ? "thrown" : "", tone ?? ""].filter(Boolean).join(" ");
  return (
    <span className={classes} style={thrown ? { transform: `rotate(${rotate}deg)` } : undefined} aria-hidden>
      <span>{thrown ? value : shape === 100 ? "%" : shape}</span>
    </span>
  );
};
