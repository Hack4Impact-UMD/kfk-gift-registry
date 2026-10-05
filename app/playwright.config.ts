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
  globalTimeout: 5 * 60_000,
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
  webServer: {
    // functions/storage aren't needed, and functions requires the isolate build
    command:
      "firebase emulators:start --project kfk-gift-registry --only auth,firestore,apphosting",
    cwd: "..",
    url: "http://localhost:5002",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
