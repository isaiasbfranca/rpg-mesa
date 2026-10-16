"use client";

import { useRollHistory } from "@/hooks/useRollHistory";
import { DiceRoller } from "./DiceRoller";

export const DiceRollerPanel = ({ scope }: { scope: string }) => {
  const { history, error, roll } = useRollHistory(scope);
  return <DiceRoller history={history} error={error} onRoll={roll} />;
};
