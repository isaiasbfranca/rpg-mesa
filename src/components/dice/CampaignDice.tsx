"use client";

import { useEffect, useState } from "react";
import { useCampaign } from "@/components/campaign/CampaignContext";
import { repository } from "@/data";
import { characterVisibility } from "@/domain/permissions";
import type { Character } from "@/domain/types";
import { useActor } from "@/hooks/useActor";
import { useRollHistory } from "@/hooks/useRollHistory";
import { DiceRoller } from "./DiceRoller";

export const CampaignDice = () => {
  const { campaign } = useCampaign();
  const actor = useActor();
  const { history, error, roll } = useRollHistory(campaign.id);
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    repository.listCharacters(campaign.id).then(setCharacters);
  }, [campaign.id]);

  return (
    <DiceRoller
      history={history} error={error} onRoll={roll}
      authorOf={(id) => characters.find((c) => c.id === id && characterVisibility(actor, c) !== "nenhuma")}
    />
  );
};
