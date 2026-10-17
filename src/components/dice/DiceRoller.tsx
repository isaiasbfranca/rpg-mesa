"use client";

import { useState, type FormEvent } from "react";
import { Die } from "./Die";
import { naturalResult, type DiceRoll, type RollMode, type SingleRoll } from "@/domain/dice";
import { CharacterAvatar } from "@/components/avatar/CharacterAvatar";
import type { Avatar } from "@/domain/avatar";
import type { RollRequest } from "@/hooks/useRollHistory";

/** Quem rolou: o nome e a aparência do personagem, quando a tela conhece os personagens. */
export type RollAuthorLookup = (characterId: string) => { name: string; avatar?: Avatar } | undefined;

const QUICK_DICE = [4, 6, 8, 10, 12, 20, 100];
const MAX_PER_DIE = 20;
const MAX_MODIFIER = 30;
const MODE_LABELS: Record<RollMode, string> = { normal: "Normal", vantagem: "Vantagem", desvantagem: "Desvantagem" };
const MODE_SHORT: Record<RollMode, string> = { normal: "Normal", vantagem: "Vant.", desvantagem: "Desv." };
const MAX_SHOWN_DICE = 12;

type Pool = Record<number, number>;

/** Expressão montada pelos botões, ex.: "2d6 + 1d20 + 3"; vazia quando não há dado. */
export const poolExpression = (pool: Pool, modifier: number): string => {
  const dice = QUICK_DICE.filter((sides) => (pool[sides] ?? 0) > 0).map((sides) => `${pool[sides]}d${sides}`);
  if (dice.length === 0) return "";
  const flat = modifier === 0 ? "" : modifier > 0 ? ` + ${modifier}` : ` − ${Math.abs(modifier)}`;
  return dice.join(" + ") + flat;
};

const describeAttempt = (attempt: SingleRoll) => {
  const dice = attempt.rolls.map((r) => `${r.sign < 0 ? "− " : ""}d${r.sides} (${r.values.join(", ")})`).join(" + ");
  if (attempt.modifier === 0) return dice;
  return `${dice} ${attempt.modifier > 0 ? "+" : "−"} ${Math.abs(attempt.modifier)}`;
};

const NATURAL_LABEL = { critico: "20 natural!", falha: "1 natural" } as const;

const keptAttempt = (roll: DiceRoll) => roll.attempts.find((a) => a.total === roll.total) ?? roll.attempts[0];

export const LatestRoll = ({ roll, authorOf }: { roll: DiceRoll; authorOf?: RollAuthorLookup }) => {
  const author = roll.characterId ? authorOf?.(roll.characterId) : undefined;
  const kept = keptAttempt(roll);
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

/** Bandeja de feltro com os dados lançados, o total e o detalhe da rolagem. */
const DiceTray = ({ roll, authorOf }: { roll?: DiceRoll; authorOf?: RollAuthorLookup }) => {
  if (!roll) {
    return (
      <div className="felt-tray tray">
        <span className="tray-label">Bandeja</span>
        <p className="subtitle" style={{ color: "rgba(239,228,204,.7)" }}>Monte os dados e lance.</p>
      </div>
    );
  }
  const kept = keptAttempt(roll);
  const natural = kept ? naturalResult(kept) : undefined;
  const thrown = (kept?.rolls ?? []).flatMap((r) => r.values.map((value) => ({ sides: r.sides, value })));
  const author = roll.characterId ? authorOf?.(roll.characterId) : undefined;
  return (
    <div className="felt-tray tray" aria-live="polite" aria-atomic="true">
      <span className="tray-label">{roll.label ?? author?.name ?? roll.expression}</span>
      <div className="thrown-row" aria-hidden>
        {thrown.slice(0, MAX_SHOWN_DICE).map((die, index) => {
          const tone = die.sides === 20 && die.value === 20 ? "crit" : die.sides === 20 && die.value === 1 ? "fail" : undefined;
          return <Die key={index} sides={die.sides} value={die.value} tone={tone} rotate={((index * 7) % 25) - 12} />;
        })}
      </div>
      <p className={`roll-total ${natural ? `roll-${natural}` : ""}`}>{roll.total}</p>
      <p className="row" style={{ justifyContent: "center" }}>
        {natural && <span className="tag">{NATURAL_LABEL[natural]}</span>}
        {roll.mode !== "normal" && <span className="tag">{MODE_LABELS[roll.mode]}</span>}
      </p>
      {roll.attempts.map((attempt, index) => (
        <p key={index} className="mono" style={{ fontSize: 13, color: "rgba(239,228,204,.75)" }}>
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
  const [pool, setPool] = useState<Pool>({});
  const [modifier, setModifier] = useState(0);

  const assembled = poolExpression(pool, modifier);

  const addDie = (sides: number) => setPool((p) => ({ ...p, [sides]: Math.min((p[sides] ?? 0) + 1, MAX_PER_DIE) }));
  const clear = () => {
    setPool({});
    setModifier(0);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onRoll({ expression, mode });
  };

  const [latest] = history;

  return (
    <section className="dice-layout" aria-label="Rolador de dados">
      <div className="stack" style={{ gap: 20 }}>
        {showLatest && <DiceTray roll={latest} authorOf={authorOf} />}

        <div className="leather stack" style={{ gap: 16 }}>
          <h2 style={{ fontSize: 22 }}>Montar a rolagem</h2>
          <div className="dice-buttons" role="group" aria-label="Dados">
            {QUICK_DICE.map((sides) => {
              const count = pool[sides] ?? 0;
              return (
                <button
                  key={sides} type="button" className={`dice-btn ${count > 0 ? "on" : ""}`}
                  onClick={() => addDie(sides)} aria-label={`Adicionar d${sides}${count > 0 ? ` (${count} no total)` : ""}`}
                >
                  <Die sides={sides} />
                  <span>d{sides}</span>
                  {count > 0 && <span className="count" aria-hidden>×{count}</span>}
                </button>
              );
            })}
            <button type="button" className="dice-btn" onClick={clear} aria-label="Recolher dados">
              <span className="eyebrow">Recolher</span>
            </button>
          </div>
          <div className="row spread">
            <span className="stepper" role="group" aria-label="Modificador">
              <button type="button" className="secondary" aria-label="Diminuir modificador" onClick={() => setModifier((m) => Math.max(m - 1, -MAX_MODIFIER))}>−</button>
              <span className="out" aria-live="polite">{modifier > 0 ? `+${modifier}` : modifier}</span>
              <button type="button" className="secondary" aria-label="Aumentar modificador" onClick={() => setModifier((m) => Math.min(m + 1, MAX_MODIFIER))}>+</button>
            </span>
            <div className="segmented" role="group" aria-label="Modo">
              {(Object.keys(MODE_LABELS) as RollMode[]).map((value) => (
                <button key={value} type="button" aria-pressed={mode === value} aria-label={MODE_LABELS[value]} onClick={() => setMode(value)}>{MODE_SHORT[value]}</button>
              ))}
            </div>
          </div>
          <div className="row spread">
            <span className="expression">{assembled || "—"}</span>
            <button type="button" className="btn-lg" disabled={!assembled} onClick={() => onRoll({ expression: assembled.replace(/−/g, "-"), mode })}>
              Lançar
            </button>
          </div>
          <div className="divider"><i /></div>
          <form className="row" onSubmit={handleSubmit} style={{ alignItems: "flex-end" }}>
            <label style={{ flex: "1 1 160px" }}>
              Expressão
              <input value={expression} onChange={(e) => setExpression(e.target.value)} placeholder="2d6+3" inputMode="text" />
            </label>
            <button type="submit" className="secondary">Rolar</button>
          </form>
          {error && <p className="error" role="alert">{error}</p>}
        </div>
      </div>

      <aside className="parchment stack" style={{ gap: 8, alignSelf: "start" }} aria-label="Crônica de rolagens">
        <h2 style={{ fontSize: 24 }}>Crônica <span className="help" style={{ fontSize: 13 }}><span className="live-dot" />local</span></h2>
        {history.length === 0 && <p className="muted subtitle">Nenhuma rolagem ainda.</p>}
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {history.map((r) => {
            const author = r.characterId ? authorOf?.(r.characterId) : undefined;
            const natural = (() => { const k = keptAttempt(r); return k ? naturalResult(k) : undefined; })();
            return (
              <li key={r.rolledAt + r.total} className="chronicle-row">
                {author && <CharacterAvatar avatar={author.avatar} name={author.name} size={32} />}
                <span style={{ minWidth: 0 }}>
                  <strong>{r.label ?? author?.name ?? "Rolagem"}</strong>
                  <span className="mono muted" style={{ display: "block", fontSize: 12 }}>{r.expression}</span>
                </span>
                <span className={`total ${natural ? `roll-${natural}` : ""}`}>{r.total}</span>
              </li>
            );
          })}
        </ul>
      </aside>
    </section>
  );
};
