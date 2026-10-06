import { logger } from "@sentry/tanstackstart-react";
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import admin from "firebase-admin";

const APPCHECK_TOKEN_HEADER = "X-APPCHECK";

export const appCheckMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getAppCheckToken } = await import("@/lib/firebase");
    return next({
      headers: {
        [APPCHECK_TOKEN_HEADER]: (await getAppCheckToken()) ?? "",
      },
    });
  })
  .server(async ({ next }) => {
    // there's no App Check emulator; the emulators set FIRESTORE_EMULATOR_HOST
    const skipVerification =
      import.meta.env.DEV && !!process.env.FIRESTORE_EMULATOR_HOST;
    const appCheckClaims = skipVerification ? null : await verifyAppCheck();

    return next({
      context: {
        appCheckClaims,
      },
    });
  });

async function verifyAppCheck() {
  const req = getRequest();
  const appCheckToken = req.headers.get(APPCHECK_TOKEN_HEADER);

  if (!appCheckToken) {
    logger.warn("Rejected request: missing App Check token");
    throw new Error("[appcheck middleware]: Missing AppCheck token");
  }

  try {
    return await admin.appCheck().verifyToken(appCheckToken);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.warn("Rejected request: App Check verification failed", {
      error: errorMessage,
    });
    throw new Error(
      `[appcheck middleware]: Token verification failed - ${errorMessage}`,
    );
  }
}
