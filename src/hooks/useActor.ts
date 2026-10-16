"use client";

import { useCampaign } from "@/components/campaign/CampaignContext";
import { repository } from "@/data";
import type { Actor } from "@/domain/permissions";

/** No esqueleto o papel vem do dono da campanha; com servidor, vem da Participação. */
export const useActor = (): Actor => {
  const { campaign } = useCampaign();
  const userId = repository.currentUserId();
  return { userId, role: campaign.masterId === userId ? "mestra" : "jogador" };
};
