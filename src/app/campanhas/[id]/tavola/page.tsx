import { PLACEHOLDER_ID } from "@/hooks/routePlaceholder";
import { TavolaBoard } from "@/components/campaign/TavolaBoard";

const TavolaPage = () => <TavolaBoard />;

/** Export estático (GitHub Pages): uma página-modelo; o id real vem da URL no navegador. */
export const generateStaticParams = () => [{ id: PLACEHOLDER_ID }];

export default TavolaPage;
