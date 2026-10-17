"use client";

import { useSyncExternalStore } from "react";

import { PLACEHOLDER_ID } from "./routePlaceholder";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const NAVIGATED_EVENT = "mesa:navegou";
let historyPatched = false;

/** O roteador do Next navega com pushState/replaceState, que não avisam ninguém; avisamos nós. */
const patchHistory = () => {
  if (historyPatched) return;
  historyPatched = true;
  for (const method of ["pushState", "replaceState"] as const) {
    const original = window.history[method].bind(window.history);
    window.history[method] = (...args: Parameters<History["pushState"]>) => {
      original(...args);
      window.dispatchEvent(new Event(NAVIGATED_EVENT));
    };
  }
};

const subscribe = (onChange: () => void) => {
  patchHistory();
  window.addEventListener(NAVIGATED_EVENT, onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener(NAVIGATED_EVENT, onChange);
    window.removeEventListener("popstate", onChange);
  };
};
const currentPath = () => window.location.pathname;
const serverPath = () => "";

const stripBase = (path: string) => {
  const withoutBase = BASE_PATH && path.startsWith(BASE_PATH) ? path.slice(BASE_PATH.length) : path;
  return withoutBase.replace(/\/+$/, "") || "/";
};

/** Caminho real da URL (sem basePath e sem barra final), igual ao que o usuário vê. */
export const useRealPath = () => stripBase(useSyncExternalStore(subscribe, currentPath, serverPath));

/** Devolve o id da rota; se for o placeholder do export estático, lê o id real da URL. */
export const useRouteId = (id: string, segment: "campanhas" | "personagens"): string | undefined => {
  const path = useRealPath();
  if (id !== PLACEHOLDER_ID) return id;
  const parts = path.split("/");
  const at = parts.indexOf(segment);
  const found = at >= 0 ? parts[at + 1] : undefined;
  return found && found !== PLACEHOLDER_ID ? found : undefined;
};
