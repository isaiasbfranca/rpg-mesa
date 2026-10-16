import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isStore, localStorageRepository } from "./localStorageRepository";
import { readJson, STORAGE_PROBLEM_EVENT, StorageError, writeJson } from "./storage";

class MemoryStorage {
  data = new Map<string, string>();
  failWrites = false;
  getItem = (key: string) => this.data.get(key) ?? null;
  setItem = (key: string, value: string) => {
    if (this.failWrites) throw new Error("QuotaExceededError");
    this.data.set(key, value);
  };
  removeItem = (key: string) => void this.data.delete(key);
}

let storage: MemoryStorage;
let problems: string[];

beforeEach(() => {
  storage = new MemoryStorage();
  problems = [];
  const target = new EventTarget();
  target.addEventListener(STORAGE_PROBLEM_EVENT, (e) => problems.push(String((e as CustomEvent).detail)));
  vi.stubGlobal("window", Object.assign(target, { localStorage: storage }));
});

afterEach(() => vi.unstubAllGlobals());

describe("DEF-02: JSON corrompido", () => {
  it("guarda cópia, avisa e não apaga os dados antigos na próxima escrita", async () => {
    storage.data.set("mesa:v1", '{"campaigns": [{"id": "a"');
    await localStorageRepository.createCampaign({
      name: "Nova", system: "", description: "", modifierRule: "nenhum", defaultDie: 20, template: { version: 1, sections: [] },
    });
    const backups = [...storage.data.entries()].filter(([key]) => key.startsWith("mesa:v1:backup:"));
    expect(backups).toHaveLength(1);
    expect(backups[0]?.[1]).toBe('{"campaigns": [{"id": "a"');
    expect(problems[0]).toMatch(/corrompidos/);
  });

  it("formato inesperado também vai para o backup", () => {
    storage.data.set("mesa:v1", '{"campaigns": "x"}');
    expect(readJson("mesa:v1", () => null, isStore)).toBeNull();
    expect([...storage.data.keys()].some((k) => k.startsWith("mesa:v1:backup:"))).toBe(true);
  });

  it("sem conseguir guardar cópia, recusa seguir em vez de sobrescrever", () => {
    storage.data.set("mesa:v1", "{lixo");
    storage.failWrites = true;
    expect(() => readJson("mesa:v1", () => null, isStore)).toThrow(StorageError);
    expect(storage.data.get("mesa:v1")).toBe("{lixo");
  });
});

describe("DEF-04: escrita recusada", () => {
  it("avisa e lança StorageError", () => {
    storage.failWrites = true;
    expect(() => writeJson("x", { a: 1 })).toThrow(StorageError);
    expect(problems[0]).toMatch(/Não foi possível salvar/);
  });
});
