import { CharacterSheet } from "@/components/character/CharacterSheet";

const CharacterPage = async ({ params }: { params: Promise<{ characterId: string }> }) => {
  const { characterId } = await params;
  return <CharacterSheet characterId={characterId} />;
};

export default CharacterPage;
