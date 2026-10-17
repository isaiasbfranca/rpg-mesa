import { PLACEHOLDER_ID } from "@/hooks/routePlaceholder";
import { NotesBoard } from "@/components/notes/NotesBoard";

const NotesPage = () => <NotesBoard />;

/** Export estático (GitHub Pages): uma página-modelo; o id real vem da URL no navegador. */
export const generateStaticParams = () => [{ id: PLACEHOLDER_ID }];

export default NotesPage;
