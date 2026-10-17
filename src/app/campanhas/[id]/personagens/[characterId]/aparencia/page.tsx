import { PLACEHOLDER_ID } from "@/hooks/routePlaceholder";
import { AvatarStudio } from "@/components/avatar/AvatarStudio";

const AppearancePage = async ({ params }: { params: Promise<{ characterId: string }> }) => {
  const { characterId } = await params;
  return <AvatarStudio characterId={characterId} />;
};

export const generateStaticParams = () => [{ id: PLACEHOLDER_ID, characterId: PLACEHOLDER_ID }];

export default AppearancePage;
