"use client";

import { createContext, useContext } from "react";
import type { Campaign } from "@/domain/types";

type CampaignContextValue = {
  campaign: Campaign;
  saveCampaign: (campaign: Campaign) => Promise<void>;
};

export const CampaignContext = createContext<CampaignContextValue | null>(null);

export const useCampaign = () => {
  const value = useContext(CampaignContext);
  if (!value) throw new Error("useCampaign precisa estar dentro de CampaignShell");
  return value;
};
