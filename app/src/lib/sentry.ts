// DSNs are public by design — safe to ship in the client bundle.
export const SENTRY_DSN =
  "https://e71961d0bd777260ef046a78ff93a3ce@o4512196250763264.ingest.us.sentry.io/4512196273438720";

export const SENTRY_ENVIRONMENT = import.meta.env.PROD
  ? "production"
  : "development";

export const SENTRY_TRACES_SAMPLE_RATE = import.meta.env.PROD ? 0.2 : 1.0;
