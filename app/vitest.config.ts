import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";

// Dedicated test config. vitest prefers this over vite.config.ts, which keeps
// the dev-only plugins (nitro, tanstackStart, tailwindcss, devtools) out of the
// test run — those open file watchers that never close and otherwise leave the
// process hanging after tests finish ("close timed out").
export default defineConfig({
  plugins: [viteTsConfigPaths({ projects: ["./tsconfig.json"] }), viteReact()],
});
