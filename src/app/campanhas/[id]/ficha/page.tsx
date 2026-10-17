import { PLACEHOLDER_ID } from "@/hooks/routePlaceholder";
import { TemplateEditor } from "@/components/template/TemplateEditor";

const TemplatePage = () => <TemplateEditor />;

/** Export estático (GitHub Pages): uma página-modelo; o id real vem da URL no navegador. */
export const generateStaticParams = () => [{ id: PLACEHOLDER_ID }];

export default TemplatePage;
