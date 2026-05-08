// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";
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
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
      // Or if you have specific aliases from tsconfig:
      // '@modules': path.resolve(__dirname, './src/modules'),
    },
  },
});
