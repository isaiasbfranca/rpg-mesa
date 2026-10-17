"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, onAuthChange, type AuthUser } from "@/auth/authService";
import { isAuthConfigured } from "@/auth/supabaseClient";

/** `undefined` enquanto carrega, `null` sem sessão (ou login não configurado). */
export const useAuthUser = (): AuthUser | null | undefined => {
  const [user, setUser] = useState<AuthUser | null | undefined>(isAuthConfigured ? undefined : null);

  useEffect(() => {
    if (!isAuthConfigured) return;
    getCurrentUser().then(setUser);
    return onAuthChange((next) => setUser(next));
  }, []);

  return user;
};
