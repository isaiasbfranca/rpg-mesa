"use client";

import { useEffect, useState } from "react";
import { useCampaign } from "@/components/campaign/CampaignContext";
import { repository } from "@/data";
import { characterVisibility } from "@/domain/permissions";
import type { Character } from "@/domain/types";
import { useActor } from "@/hooks/useActor";
import { useLiveSession } from "@/hooks/useLiveSession";
import { useRollHistory } from "@/hooks/useRollHistory";
import { DiceRoller } from "./DiceRoller";
import { LiveBar } from "./LiveBar";

export const CampaignDice = () => {
  const { campaign } = useCampaign();
  const actor = useActor();
  const { history, error, roll } = useRollHistory(campaign.id);
  const live = useLiveSession(campaign.id);
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    repository.listCharacters(campaign.id).then(setCharacters);
  }, [campaign.id]);

  const inLive = live.available && live.joined && live.session !== undefined;

  return (
    <div className="stack">
      {live.available && <LiveBar live={live} isMaster={actor.role === "mestra"} />}
      <DiceRoller
        history={inLive ? live.rolls : history} error={inLive ? live.error : error} onRoll={inLive ? live.roll : roll}
        scopeLabel={inLive ? "ao vivo" : "local"}
        authorOf={(id) => characters.find((c) => c.id === id && characterVisibility(actor, c) !== "nenhuma")}
      />
    </div>
  );
};
