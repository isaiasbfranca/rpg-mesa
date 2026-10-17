"use client";

import { useState } from "react";
import { hasLocalData, importLocalData, readLocalData } from "@/data";
import { useAuthUser } from "@/hooks/useAuthUser";

const DONE_KEY = "mesa:enviado-para-conta";

const alreadyHandled = (userId: string) => {
  try {
    return window.localStorage.getItem(DONE_KEY)?.split(",").includes(userId) ?? false;
  } catch {
    return true;
  }
};

const markHandled = (userId: string) => {
  try {
    const handled = window.localStorage.getItem(DONE_KEY);
    window.localStorage.setItem(DONE_KEY, handled ? `${handled},${userId}` : userId);
  } catch {
    // Sem armazenamento, o aviso volta na próxima visita; enviar de novo não duplica nada.
  }
};

/** Oferece levar as campanhas salvas neste navegador para a conta recém-usada. */
export const ImportLocalBanner = () => {
  const user = useAuthUser();
  const [closed, setClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || closed || !hasLocalData() || alreadyHandled(user.id)) return null;

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      await importLocalData(user.id, readLocalData());
      markHandled(user.id);
      window.location.reload();
    } catch {
      setError("Não foi possível enviar agora. Seus dados continuam salvos neste navegador.");
      setBusy(false);
    }
  };
  const dismiss = () => {
    markHandled(user.id);
    setClosed(true);
  };

  return (
    <div className="parchment stack" role="region" aria-label="Enviar dados para a conta" style={{ gap: 8, marginBottom: 16 }}>
      <p>Este navegador tem campanhas salvas. Quer levá-las para a sua conta, para abrir em qualquer aparelho?</p>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row">
        <button type="button" onClick={send} disabled={busy}>{busy ? "Enviando…" : "Enviar para a conta"}</button>
        <button type="button" className="secondary" onClick={dismiss} disabled={busy}>Agora não</button>
      </div>
    </div>
  );
};
