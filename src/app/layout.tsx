import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { StorageAlert } from "@/components/StorageAlert";
import "@fontsource/alegreya/latin-400.css";
import "@fontsource/alegreya/latin-500.css";
import "@fontsource/alegreya/latin-700.css";
import "@fontsource/alegreya/latin-400-italic.css";
import "@fontsource/alegreya-sc/latin-500.css";
import "@fontsource/alegreya-sc/latin-700.css";
import "@fontsource/alegreya-sc/latin-800.css";
import "@fontsource/alegreya-sans-sc/latin-500.css";
import "@fontsource/alegreya-sans-sc/latin-700.css";
import "@fontsource/alegreya-sans-sc/latin-800.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-700.css";
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
        <AccountMenu />
      </nav>
      <main className="shell">
        <StorageAlert />
        {children}
      </main>
    </body>
  </html>
);

export default RootLayout;
