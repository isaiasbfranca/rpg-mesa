import { PLACEHOLDER_ID } from "@/hooks/routePlaceholder";
import { CampaignDice } from "@/components/dice/CampaignDice";

const CampaignDicePage = () => <CampaignDice />;

/** Export estático (GitHub Pages): uma página-modelo; o id real vem da URL no navegador. */
export const generateStaticParams = () => [{ id: PLACEHOLDER_ID }];

export default CampaignDicePage;
