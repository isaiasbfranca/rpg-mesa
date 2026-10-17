import { PLACEHOLDER_ID } from "@/hooks/routePlaceholder";
import { SessionLogList } from "@/components/session/SessionLogList";

const SessionsPage = () => <SessionLogList />;

/** Export estático (GitHub Pages): uma página-modelo; o id real vem da URL no navegador. */
export const generateStaticParams = () => [{ id: PLACEHOLDER_ID }];

export default SessionsPage;
