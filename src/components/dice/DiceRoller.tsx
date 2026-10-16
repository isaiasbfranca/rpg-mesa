"use client";

import { useState, type FormEvent } from "react";
import { naturalResult, type DiceRoll, type RollMode, type SingleRoll } from "@/domain/dice";
import { CharacterAvatar } from "@/components/avatar/CharacterAvatar";
import type { Avatar } from "@/domain/avatar";
import type { RollRequest } from "@/hooks/useRollHistory";

/** Quem rolou: o nome e a aparência do personagem, quando a tela conhece os personagens. */
export type RollAuthorLookup = (characterId: string) => { name: string; avatar?: Avatar } | undefined;

const QUICK_DICE = [4, 6, 8, 10, 12, 20, 100];
const MODE_LABELS: Record<RollMode, string> = { normal: "Normal", vantagem: "Vantagem", desvantagem: "Desvantagem" };

const describeAttempt = (attempt: SingleRoll) => {
  const dice = attempt.rolls.map((r) => `${r.sign < 0 ? "− " : ""}d${r.sides} (${r.values.join(", ")})`).join(" + ");
  if (attempt.modifier === 0) return dice;
  return `${dice} ${attempt.modifier > 0 ? "+" : "−"} ${Math.abs(attempt.modifier)}`;
};

const NATURAL_LABEL = { critico: "20 natural!", falha: "1 natural" } as const;

export const LatestRoll = ({ roll, authorOf }: { roll: DiceRoll; authorOf?: RollAuthorLookup }) => {
  const author = roll.characterId ? authorOf?.(roll.characterId) : undefined;
  const kept = roll.attempts.find((a) => a.total === roll.total) ?? roll.attempts[0];
  const natural = kept ? naturalResult(kept) : undefined;
  return (
    <div className="stack" style={{ gap: 4 }}>
      {(roll.label || author) && (
        <p className="row muted">
          {author && <CharacterAvatar avatar={author.avatar} name={author.name} size={32} />}
          {roll.label ?? author?.name}
        </p>
      )}
      <p className="row">
        <span className={`roll-total ${natural ? `roll-${natural}` : ""}`}>{roll.total}</span>
        {natural && <span className="tag">{NATURAL_LABEL[natural]}</span>}
        {roll.mode !== "normal" && <span className="tag">{MODE_LABELS[roll.mode]}</span>}
      </p>
      {roll.attempts.map((attempt, index) => (
        <p key={index} className="mono muted" style={{ fontSize: 14 }}>
          {describeAttempt(attempt)} = {attempt.total}
        </p>
      ))}
    </div>
  );
};

type Props = {
  history: DiceRoll[];
  error?: string;
  onRoll: (request: RollRequest) => void;
  /** Falso quando a tela já mostra o último resultado em outro lugar (ex.: barra fixa da ficha). */
  showLatest?: boolean;
  authorOf?: RollAuthorLookup;
};

export const DiceRoller = ({ history, error, onRoll, showLatest = true, authorOf }: Props) => {
  const [expression, setExpression] = useState("1d20");
  const [mode, setMode] = useState<RollMode>("normal");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onRoll({ expression, mode });
  };

  const [latest, ...older] = history;

  return (
    <section className="card stack" aria-label="Rolador de dados">
      <form className="row" onSubmit={handleSubmit} style={{ alignItems: "flex-end" }}>
        <label style={{ flex: "1 1 160px" }}>
          Expressão
          <input value={expression} onChange={(e) => setExpression(e.target.value)} placeholder="2d6+3" inputMode="text" />
        </label>
        <label>
          Modo
          <select value={mode} onChange={(e) => setMode(e.target.value as RollMode)}>
            {Object.entries(MODE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <button type="submit">Rolar</button>
      </form>
      <div className="row">
        {QUICK_DICE.map((sides) => (
          <button key={sides} type="button" className="secondary" onClick={() => onRoll({ expression: `1d${sides}`, mode })}>
            d{sides}
          </button>
        ))}
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {showLatest && <div aria-live="polite" aria-atomic="true">{latest && <LatestRoll roll={latest} authorOf={authorOf} />}</div>}
      {(showLatest ? older : history).length > 0 && (
        <details>
          <summary className="muted">Histórico ({(showLatest ? older : history).length})</summary>
          <ul className="mono muted" style={{ fontSize: 14 }}>
            {(showLatest ? older : history).map((r) => (
              <li key={r.rolledAt + r.total} className="row" style={{ gap: 6 }}>
                {r.characterId && authorOf?.(r.characterId) && (
                  <CharacterAvatar avatar={authorOf(r.characterId)?.avatar} name={authorOf(r.characterId)?.name ?? ""} size={24} />
                )}
                {r.label ? `${r.label}: ` : ""}{r.expression} = {r.total}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
};
