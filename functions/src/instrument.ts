import * as Sentry from "@sentry/node";

// DSNs are public by design. FUNCTIONS_EMULATOR is set by the Firebase emulator.
Sentry.init({
  dsn: "https://7c2a37a012740151f1e7c7b82e984d51@o4512196250763264.ingest.us.sentry.io/4512196273504256",
  environment:
    process.env.FUNCTIONS_EMULATOR === "true" ? "development" : "production",
  tracesSampleRate: 1.0,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
});
