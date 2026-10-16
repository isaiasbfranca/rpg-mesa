"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { loadRollHistory, pushRoll } from "@/data";
import { DiceParseError, rollDice, type DiceRoll, type RollMode } from "@/domain/dice";

export type RollRequest = { expression: string; mode?: RollMode; label?: string; characterId?: string };

const NO_ROLLS: DiceRoll[] = [];
const ROLLS_CHANGED_EVENT = "mesa:rolagens-alteradas";

/** Cache por escopo para o snapshot ser estável entre renderizações, como o useSyncExternalStore exige. */
const snapshots = new Map<string, DiceRoll[]>();

const snapshotFor = (scope: string) => {
  const cached = snapshots.get(scope);
  if (cached) return cached;
  const loaded = loadRollHistory(scope);
  snapshots.set(scope, loaded);
  return loaded;
};

const subscribe = (onChange: () => void) => {
  window.addEventListener(ROLLS_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(ROLLS_CHANGED_EVENT, onChange);
};

export const useRollHistory = (scope: string) => {
  const history = useSyncExternalStore(subscribe, () => snapshotFor(scope), () => NO_ROLLS);
  const [error, setError] = useState<string>();

  const roll = useCallback(
    ({ expression, mode, label, characterId }: RollRequest) => {
      try {
        snapshots.set(scope, pushRoll(scope, rollDice(expression, { mode, label, characterId })));
        window.dispatchEvent(new Event(ROLLS_CHANGED_EVENT));
        setError(undefined);
      } catch (cause) {
        if (!(cause instanceof DiceParseError)) throw cause;
        setError(cause.message);
      }
    },
    [scope],
  );

  return { history, error, roll };
};
