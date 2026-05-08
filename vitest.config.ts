// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["lcov", "text"],
      include: ["**/*.ts"],
      exclude: ["**/node_modules/**", "**/dist/**", "**/*.d.ts"],
      reportsDirectory: "coverage",
    },
    exclude: ["**/node_modules/**", "**/dist/**"],
    include: ["**/test/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],

    reporters: ["verbose"],
  },
});
