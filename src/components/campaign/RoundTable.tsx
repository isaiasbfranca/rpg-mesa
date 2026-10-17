import { seatPositions } from "@/domain/table";

export type SeatInfo = {
  kind: "master" | "player" | "pending" | "empty";
  initials: string;
  name: string;
  sub?: string;
};

type Props = {
  seats: SeatInfo[];
  /** Largura e altura da mesa em px; o raio das cadeiras vem do tamanho. */
  width: number;
  height: number;
  radius: number;
  topSize: number;
  compact?: boolean;
  children?: React.ReactNode;
};

const TOKEN_CLASS = { master: "master", player: "", pending: "dashed", empty: "empty" } as const;

export const RoundTable = ({ seats, width, height, radius, topSize, compact = false, children }: Props) => {
  const positions = seatPositions(seats.length, radius);
  return (
    <div className="round-table" style={{ width, height, maxWidth: "100%" }}>
      <div className="top" style={{ width: topSize, height: topSize }}>{children}</div>
      {seats.map((seat, index) => (
        <div
          key={index} className={`seat ${seat.kind} ${compact ? "compact" : ""}`}
          style={{ left: `calc(50% + ${positions[index]?.x ?? 0}px)`, top: `calc(50% + ${positions[index]?.y ?? 0}px)` }}
        >
          <span className={`token ${TOKEN_CLASS[seat.kind]}`} aria-hidden>{seat.initials}</span>
          {!compact && <span className="name">{seat.name}</span>}
          {!compact && seat.sub && <span className="sub">{seat.sub}</span>}
          <span className="sr-only">{seat.name}{seat.sub ? `, ${seat.sub}` : ""}</span>
        </div>
      ))}
    </div>
  );
};
