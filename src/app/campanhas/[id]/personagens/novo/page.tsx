import { PLACEHOLDER_ID } from "@/hooks/routePlaceholder";
import { CharacterWizard } from "@/components/character/CharacterWizard";

const NewCharacterPage = () => <CharacterWizard />;

/** Export estático (GitHub Pages): uma página-modelo; o id real vem da URL no navegador. */
export const generateStaticParams = () => [{ id: PLACEHOLDER_ID }];

export default NewCharacterPage;
