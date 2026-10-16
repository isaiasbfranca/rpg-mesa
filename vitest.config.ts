import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/domain/**", "src/data/**"],
      exclude: ["**/*.test.ts", "src/data/index.ts", "src/data/repository.ts"],
      // RNF-12: ≥ 80% no interpretador de dados, no cálculo de modificador e nas permissões.
      thresholds: {
        "src/domain/dice.ts": { lines: 80, branches: 80, functions: 80, statements: 80 },
        "src/domain/sheet.ts": { lines: 80, branches: 80, functions: 80, statements: 80 },
        "src/domain/permissions.ts": { lines: 80, branches: 80, functions: 80, statements: 80 },
        "src/domain/avatar.ts": { lines: 80, branches: 80, functions: 80, statements: 80 },
        "src/domain/portrait.ts": { lines: 80, branches: 80, functions: 80, statements: 80 },
        "src/domain/portraitSvg.ts": { lines: 80, branches: 80, functions: 80, statements: 80 },
      },
    },
  },
});
