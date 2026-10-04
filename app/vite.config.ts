import { URL, fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";

import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";

const config = defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@assets": fileURLToPath(new URL("../assets", import.meta.url)),
    },
  },
  environments: {
    nitro: {
      resolve: {
        external: [
          "firebase-admin",
          "@google-cloud/firestore",
          "google-gax",
          "@grpc/grpc-js",
        ],
      },
    },
  },
  plugins: [
    devtools(),
    nitro({ noExternals: true }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      importProtection: {
        enabled: true,
      },
    }),
    viteReact(),
    // Must be last. Uploads source maps when SENTRY_AUTH_TOKEN is set.
    sentryTanstackStart({
      org: "hack4impact-umd",
      project: "kfk-gift-registry-app",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Without a token nothing is uploaded or deleted, so don't emit
      // source maps that would end up publicly served.
      sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
      release: {
        // Set by CI; must match the release the deploy workflow creates.
        name: process.env.SENTRY_RELEASE,
        // The App Hosting build has no git history; CI associates commits.
        setCommits: false,
      },
    }),
  ],
});

export default config;
