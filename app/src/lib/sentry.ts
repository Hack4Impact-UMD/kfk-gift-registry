import type { ErrorEvent } from "@sentry/tanstackstart-react";

// DSNs are public by design — safe to ship in the client bundle.
export const SENTRY_DSN =
  "https://e71961d0bd777260ef046a78ff93a3ce@o4512196250763264.ingest.us.sentry.io/4512196273438720";

export const SENTRY_ENVIRONMENT = import.meta.env.PROD
  ? "production"
  : "development";

export const SENTRY_TRACES_SAMPLE_RATE = import.meta.env.PROD ? 0.2 : 1.0;

type SentryEvent = Pick<ErrorEvent, "exception">;

// Chrome iOS and the Google iOS app inject scripts (translate, autofill) that
// overflow the stack on our pages. Those frames report the page URL as their
// filename, so a stack overflow with no frame from a script file isn't ours.
export const isInjectedScriptStackOverflow = (event: SentryEvent): boolean => {
  const exception = event.exception?.values?.[0];
  if (exception?.type !== "RangeError") return false;
  if (!exception.value?.includes("Maximum call stack size exceeded")) {
    return false;
  }

  const frames = exception.stacktrace?.frames ?? [];
  return !frames.some((frame) =>
    /\.(m?js|tsx?)(\?|$)/.test(frame.filename ?? ""),
  );
};
