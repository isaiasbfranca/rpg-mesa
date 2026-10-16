import { AvatarStudio } from "@/components/avatar/AvatarStudio";

const AppearancePage = async ({ params }: { params: Promise<{ characterId: string }> }) => {
  const { characterId } = await params;
  return <AvatarStudio characterId={characterId} />;
};

export default AppearancePage;
