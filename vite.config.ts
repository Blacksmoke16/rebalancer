/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/**"],
    // Randomize order to surface inter-test ordering dependencies.
    sequence: { shuffle: true },
    // Restore globals patched via vi.stubGlobal between tests.
    unstubGlobals: true,
  },
});
