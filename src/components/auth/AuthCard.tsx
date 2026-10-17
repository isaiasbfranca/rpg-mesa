import Link from "next/link";
import { isAuthConfigured } from "@/auth/supabaseClient";

type Props = { eyebrow: string; title: string; subtitle?: string; children: React.ReactNode };

/** Pergaminho com selo de cera, mesmo visual do convite. Sem configuração, só explica que o login está desligado. */
export const AuthCard = ({ eyebrow, title, subtitle, children }: Props) => (
  <div className="parchment stack" style={{ maxWidth: 480, margin: "48px auto 0", position: "relative", alignItems: "stretch", gap: 14 }}>
    <span className="wax-seal" aria-hidden style={{ right: "auto", left: "50%", marginLeft: -34 }}>M</span>
    <p className="eyebrow" style={{ marginTop: 30, textAlign: "center" }}>{eyebrow}</p>
    <h1 style={{ fontSize: 32, textAlign: "center" }}>{title}</h1>
    {subtitle && <p className="subtitle" style={{ textAlign: "center", fontSize: 18 }}>{subtitle}</p>}
    <div className="divider"><i /></div>
    {isAuthConfigured ? children : (
      <>
        <p className="subtitle" style={{ textAlign: "center" }}>As contas ainda não foram ativadas neste endereço. Seus dados continuam salvos só neste navegador.</p>
        <Link href="/campanhas" className="btn-gold-link" style={{ justifyContent: "center" }}>Ir para as campanhas</Link>
      </>
    )}
  </div>
);
