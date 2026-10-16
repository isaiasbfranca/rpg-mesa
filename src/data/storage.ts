/** Problemas de armazenamento local viram eventos que o StorageAlert mostra na tela. */
export const STORAGE_PROBLEM_EVENT = "mesa:problema-armazenamento";

export class StorageError extends Error {}

const report = (message: string) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string>(STORAGE_PROBLEM_EVENT, { detail: message }));
};

/**
 * Lê JSON do localStorage. Se o conteúdo estiver corrompido ou fora do formato,
 * guarda uma cópia em `<chave>:backup:<data>` antes de devolver o valor padrão,
 * para a próxima escrita não apagar o que havia (DEF-02).
 */
export const readJson = <T>(key: string, fallback: () => T, isValid: (value: unknown) => value is T): T => {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    report("Não foi possível ler os dados salvos neste navegador.");
    return fallback();
  }
  if (raw === null) return fallback();

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isValid(parsed)) return parsed;
  } catch {
    // Cai no backup abaixo.
  }

  const backupKey = `${key}:backup:${new Date().toISOString()}`;
  try {
    window.localStorage.setItem(backupKey, raw);
    window.localStorage.removeItem(key);
    report(`Os dados salvos estavam corrompidos. Guardamos uma cópia em "${backupKey}" e começamos do zero.`);
  } catch {
    report("Os dados salvos estão corrompidos e não foi possível guardar uma cópia. Nada será sobrescrito.");
    throw new StorageError("Dados corrompidos sem cópia de segurança");
  }
  return fallback();
};

/** Escreve JSON; se o navegador recusar (cheio ou bloqueado), avisa e lança erro (DEF-04). */
export const writeJson = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    const message = "Não foi possível salvar. O armazenamento do navegador está cheio ou bloqueado (por exemplo, em aba privada).";
    report(message);
    throw new StorageError(message);
  }
};
