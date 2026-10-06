import { defineConfig, devices } from "@playwright/test";

// e2e tests run against the local firebase emulators (auth, firestore, app
// hosting). Specs are named *.e2e.ts so vitest doesn't pick them up.
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  // tests share one emulator, keep them sequential
  workers: 1,
  // fail fast on stuck tests instead of hanging
  timeout: 30_000,
  globalTimeout: 10 * 60_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:5002",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node e2e/mocks/resend-server.ts",
      url: "http://127.0.0.1:4010",
      reuseExistingServer: false,
    },
    {
      // functions aren't needed, and require the isolate build
      command:
        "firebase emulators:start --project kfk-gift-registry --only auth,firestore,storage,apphosting",
      cwd: "..",
      url: "http://localhost:5002",
      // tests wipe emulator data and need the env below, so never reuse a
      // dev emulator (it would also send real emails)
      reuseExistingServer: false,
      timeout: 180_000,
      // let firebase stop its emulators, or the java processes outlive it
      gracefulShutdown: { signal: "SIGINT", timeout: 15_000 },
      env: {
        RESEND_API_KEY: "re_e2e",
        RESEND_BASE_URL: "http://127.0.0.1:4010",
      },
    },
  ],
});
