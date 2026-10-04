import {
  sentryGlobalFunctionMiddleware,
  sentryGlobalRequestMiddleware,
} from "@sentry/tanstackstart-react";
import { isRedirect } from "@tanstack/react-router";
import { createMiddleware, createStart } from "@tanstack/react-start";

const convertRedirectErrorToExceptionMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const result = await next();
  if ("error" in result && isRedirect(result.error)) {
    throw result.error;
  }
  return result;
});

export const startInstance = createStart(() => ({
  // Sentry middleware must come first in each array.
  requestMiddleware: [sentryGlobalRequestMiddleware],
  functionMiddleware: [
    sentryGlobalFunctionMiddleware,
    convertRedirectErrorToExceptionMiddleware,
  ],
}));
