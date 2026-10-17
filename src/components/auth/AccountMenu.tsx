"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/auth/authService";
import { isAuthConfigured } from "@/auth/supabaseClient";
import { useAuthUser } from "@/hooks/useAuthUser";

/** Canto da barra superior: conta logada, convite para entrar, ou o usuário local quando o login está desligado. */
export const AccountMenu = () => {
  const user = useAuthUser();
  const router = useRouter();

  if (!isAuthConfigured)
    return (
      <span className="who" title="Usuário local, sempre mestra">
        <span>Mestra</span>
        <span className="token master" aria-hidden>M</span>
      </span>
    );
  if (user === undefined) return <span className="who" aria-hidden />;
  if (user === null) return <Link href="/entrar" className="who">Entrar</Link>;

  const leave = async () => {
    await signOut();
    router.push("/entrar");
  };
  return (
    <span className="who">
      <span title={user.email}>{user.email}</span>
      <span className="token master" aria-hidden>{user.email.charAt(0).toLocaleUpperCase("pt-BR")}</span>
      <button type="button" className="link-btn" onClick={leave}>Sair</button>
    </span>
  );
};
