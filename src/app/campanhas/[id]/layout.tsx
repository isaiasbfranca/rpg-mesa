import { CampaignShell } from "@/components/campaign/CampaignShell";

const CampaignLayout = async ({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <CampaignShell campaignId={id}>{children}</CampaignShell>;
};

export default CampaignLayout;
