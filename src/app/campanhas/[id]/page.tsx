import { PLACEHOLDER_ID } from "@/hooks/routePlaceholder";
import { CampaignDashboard } from "@/components/campaign/CampaignDashboard";

const CampaignPage = () => <CampaignDashboard />;

/** Export estático (GitHub Pages): uma página-modelo; o id real vem da URL no navegador. */
export const generateStaticParams = () => [{ id: PLACEHOLDER_ID }];

export default CampaignPage;
