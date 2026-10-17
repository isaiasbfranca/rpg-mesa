import { PLACEHOLDER_ID } from "@/hooks/routePlaceholder";
import { CharacterSheet } from "@/components/character/CharacterSheet";

const CharacterPage = async ({ params }: { params: Promise<{ characterId: string }> }) => {
  const { characterId } = await params;
  return <CharacterSheet characterId={characterId} />;
};

export const generateStaticParams = () => [{ id: PLACEHOLDER_ID, characterId: PLACEHOLDER_ID }];

export default CharacterPage;
