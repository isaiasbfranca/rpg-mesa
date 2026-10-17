import { getCurrentUser, onAuthChange } from "@/auth/authService";
import { isAuthConfigured } from "@/auth/supabaseClient";
import { localStorageRepository } from "./localStorageRepository";
import type { Repository } from "./repository";
import { createSupabaseRepository } from "./supabaseRepository";

let backend: Repository = localStorageRepository;
let backendUserId: string | null = null;

const switchBackend = (userId: string | null) => {
  if (userId === backendUserId) return;
  backendUserId = userId;
  backend = userId ? createSupabaseRepository(userId) : localStorageRepository;
};

/** Descobre a conta antes de cada chamada de dados; sem login (ou sem serviço de contas) tudo fica no navegador. */
const ready = async () => {
  if (isAuthConfigured) switchBackend((await getCurrentUser())?.id ?? null);
  return backend;
};

if (typeof window !== "undefined" && isAuthConfigured) onAuthChange((user) => switchBackend(user?.id ?? null));

type AsyncMethod = (...args: never[]) => Promise<unknown>;

const isAsyncMethod = (value: unknown): value is AsyncMethod => typeof value === "function";

/** Mesmo contrato do repositório; cada chamada vai para o armazenamento da conta atual. */
export const repository: Repository = new Proxy(localStorageRepository, {
  get: (_target, name: string) => {
    if (name === "currentUserId") return () => backend.currentUserId();
    return async (...args: unknown[]) => {
      const current = await ready();
      const method: unknown = Reflect.get(current, name);
      if (!isAsyncMethod(method)) throw new Error(`Operação desconhecida: ${name}`);
      return Reflect.apply(method, current, args);
    };
  },
});

export { hasLocalData, readLocalData } from "./localStorageRepository";
export { importLocalData } from "./supabaseRepository";
export { loadRollHistory, pushRoll, ROLL_HISTORY_LIMIT } from "./rollHistory";
export type { NewCampaign, NewCharacter, NewInvite, NewNote, NewSessionLog, Repository } from "./repository";
export { STORAGE_PROBLEM_EVENT, StorageError } from "./storage";
