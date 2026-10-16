import type { DiceRoll } from "@/domain/dice";
import { readJson, StorageError, writeJson } from "./storage";

/** Histórico local ao aparelho (RF-14): últimas 50 rolagens por campanha, mais recente primeiro. */
export const ROLL_HISTORY_LIMIT = 50;

const keyFor = (scope: string) => `mesa:rolagens:${scope}`;

const isRollList = (value: unknown): value is DiceRoll[] => Array.isArray(value);

export const loadRollHistory = (scope: string): DiceRoll[] => readJson(keyFor(scope), () => [], isRollList);

export const pushRoll = (scope: string, roll: DiceRoll): DiceRoll[] => {
  const history = [roll, ...loadRollHistory(scope)].slice(0, ROLL_HISTORY_LIMIT);
  try {
    writeJson(keyFor(scope), history);
  } catch (cause) {
    // Sem armazenamento, a rolagem continua valendo; o histórico só não persiste.
    if (!(cause instanceof StorageError)) throw cause;
  }
  return history;
};
