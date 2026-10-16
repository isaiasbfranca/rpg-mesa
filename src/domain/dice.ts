export type DiceTerm = { count: number; sides: number; sign: 1 | -1 };

export type DiceExpression = { dice: DiceTerm[]; modifier: number };

export type RollMode = "normal" | "vantagem" | "desvantagem";

export type SingleRoll = {
  rolls: { sides: number; sign: 1 | -1; values: number[] }[];
  modifier: number;
  total: number;
};

export type DiceRoll = {
  expression: string;
  mode: RollMode;
  /** Duas tentativas em vantagem/desvantagem; uma no modo normal. */
  attempts: SingleRoll[];
  total: number;
  label?: string;
  /** Personagem que rolou, para mostrar o avatar no histórico (E12). */
  characterId?: string;
  rolledAt: string;
};

export type RandomInt = (sides: number) => number;

export const MAX_DICE = 100;
export const MIN_SIDES = 2;
export const MAX_SIDES = 1000;
export const MAX_FLAT = 1000;
export const MAX_TERMS = 10;
export const MAX_LENGTH = 100;
const TERM_PATTERN = /([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/gi;
const UINT32_RANGE = 2 ** 32;

export class DiceParseError extends Error {}

/** Inteiro uniforme em [1, sides] via crypto, com rejeição para evitar viés de módulo (RNF-05). */
export const cryptoRandom: RandomInt = (sides) => {
  const limit = UINT32_RANGE - (UINT32_RANGE % sides);
  const buffer = new Uint32Array(1);
  for (;;) {
    globalThis.crypto.getRandomValues(buffer);
    const value = buffer[0] ?? 0;
    if (value < limit) return (value % sides) + 1;
  }
};

/** Interpreta expressões como "2d6+3", "d20", "1d8+1d4-1" (RF-12). */
export const parseDice = (input: string): DiceExpression => {
  const normalized = input.replace(/−/g, "-").toLowerCase().trim();
  if (normalized === "") throw new DiceParseError("Digite uma expressão, como 1d20+3");
  if (input.length > MAX_LENGTH) throw new DiceParseError(`Use no máximo ${MAX_LENGTH} caracteres`);
  // Espaço entre dois termos sem operador ("1d20 5") é erro, não "1d205".
  if (/[\dd]\s+[\dd]/.test(normalized)) throw new DiceParseError(`Falta + ou − em "${input}"`);
  const source = normalized.replace(/\s+/g, "");

  const dice: DiceTerm[] = [];
  let modifier = 0;
  let consumed = 0;
  let terms = 0;

  for (const match of source.matchAll(TERM_PATTERN)) {
    if (match.index !== consumed) break;
    consumed += match[0].length;
    if (++terms > MAX_TERMS) throw new DiceParseError(`Use no máximo ${MAX_TERMS} termos`);
    const isFirst = match.index === 0;
    const [, diceSign, countText, sidesText, flatSign, flatText] = match;
    const sign = diceSign ?? flatSign;
    if (!isFirst && sign === "") throw new DiceParseError(`Falta + ou − em "${input}"`);

    if (sidesText !== undefined) {
      const count = countText ? Number(countText) : 1;
      const sides = Number(sidesText);
      if (count < 1 || count > MAX_DICE) throw new DiceParseError(`Use entre 1 e ${MAX_DICE} dados`);
      if (sides < MIN_SIDES || sides > MAX_SIDES) throw new DiceParseError(`Use dados entre d${MIN_SIDES} e d${MAX_SIDES}`);
      dice.push({ count, sides, sign: diceSign === "-" ? -1 : 1 });
    } else {
      const flat = Number(flatText);
      if (flat > MAX_FLAT) throw new DiceParseError(`Cada número vai de 0 a ${MAX_FLAT}`);
      modifier += (flatSign === "-" ? -1 : 1) * flat;
    }
  }

  if (consumed !== source.length) throw new DiceParseError(`Não entendi "${input}". Exemplo: 2d6+3`);
  if (dice.length === 0) throw new DiceParseError("Inclua ao menos um dado, como d20");
  if (dice.reduce((sum, d) => sum + d.count, 0) > MAX_DICE) throw new DiceParseError(`Use no máximo ${MAX_DICE} dados por rolagem`);
  return { dice, modifier };
};

const rollOnce = ({ dice, modifier }: DiceExpression, random: RandomInt): SingleRoll => {
  const rolls = dice.map(({ count, sides, sign }) => ({
    sides,
    sign,
    values: Array.from({ length: count }, () => random(sides)),
  }));
  const diceTotal = rolls.reduce((sum, r) => sum + r.sign * r.values.reduce((a, b) => a + b, 0), 0);
  return { rolls, modifier, total: diceTotal + modifier };
};

type RollOptions = { mode?: RollMode; label?: string; characterId?: string; random?: RandomInt; now?: () => Date };

/** Vantagem/desvantagem: rola a expressão duas vezes e fica com o maior/menor total. */
export const rollDice = (input: string, options: RollOptions = {}): DiceRoll => {
  const { mode = "normal", label, characterId, random = cryptoRandom, now = () => new Date() } = options;
  const expression = parseDice(input);
  const first = rollOnce(expression, random);
  const attempts = mode === "normal" ? [first] : [first, rollOnce(expression, random)];
  const totals = attempts.map((a) => a.total);
  const total = mode === "desvantagem" ? Math.min(...totals) : Math.max(...totals);
  return { expression: input.trim(), mode, attempts, total, label, characterId, rolledAt: now().toISOString() };
};

export const attributeRollExpression = (die: number, modifier: number): string =>
  modifier === 0 ? `1d${die}` : `1d${die}${modifier > 0 ? "+" : "-"}${Math.abs(modifier)}`;

/** Natural máximo/mínimo num único d20, para o destaque de crítico pedido pelo UX. */
export const naturalResult = (roll: SingleRoll): "critico" | "falha" | undefined => {
  const [only] = roll.rolls;
  if (roll.rolls.length !== 1 || !only || only.values.length !== 1 || only.sides !== 20) return undefined;
  if (only.values[0] === 20) return "critico";
  if (only.values[0] === 1) return "falha";
  return undefined;
};
