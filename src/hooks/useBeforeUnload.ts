"use client";

import { useEffect } from "react";

/** Enquanto `active`, fechar ou recarregar a aba pede confirmação do navegador. */
export const useBeforeUnload = (active: boolean) => {
  useEffect(() => {
    if (!active) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [active]);
};
