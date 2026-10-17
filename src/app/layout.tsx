import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { StorageAlert } from "@/components/StorageAlert";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mesa",
  description: "Caderno de campanha para RPG de mesa, para qualquer sistema",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

/** Páginas-modelo do Pages chegam com ?p=<URL real>; devolve a URL real antes de a interface subir. */
const RESTORE_URL = `var p=new URLSearchParams(location.search).get("p");if(p&&p.charAt(0)==="/")history.replaceState(null,"",p);`;

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="pt-BR">
    <head>
      <script dangerouslySetInnerHTML={{ __html: RESTORE_URL }} />
    </head>
    <body>
      <nav className="topbar" aria-label="Principal">
        <Link href="/" className="brand">Mesa</Link>
        <Link href="/campanhas">Campanhas</Link>
        <Link href="/dados">Dados</Link>
      </nav>
      <main className="shell">
        <StorageAlert />
        {children}
      </main>
    </body>
  </html>
);

export default RootLayout;
