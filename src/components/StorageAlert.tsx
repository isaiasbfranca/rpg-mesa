"use client";

import { useEffect, useState } from "react";
import { STORAGE_PROBLEM_EVENT, StorageError } from "@/data";

/** Mostra problemas de leitura ou escrita local, inclusive os de ações que falharam sem tratamento. */
export const StorageAlert = () => {
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    const onProblem = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === "string") setMessage(event.detail);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof StorageError) event.preventDefault();
    };
    window.addEventListener(STORAGE_PROBLEM_EVENT, onProblem);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener(STORAGE_PROBLEM_EVENT, onProblem);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  if (!message) return null;
  return (
    <div role="alert" className="card row spread" style={{ background: "var(--crit-soft)", borderColor: "var(--crit)", marginBottom: 16 }}>
      <p>{message}</p>
      <button type="button" className="secondary" onClick={() => setMessage(undefined)}>Fechar</button>
    </div>
  );
};
