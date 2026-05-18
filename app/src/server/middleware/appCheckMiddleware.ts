import { getClientAppCheck } from "@/lib/firebase.client";
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import admin from "firebase-admin";
import { getToken } from "firebase/app-check";

const APPCHECK_TOKEN_HEADER = "X-APPCHECK";

export const appCheckMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const appcheck = await getClientAppCheck();
    return next({
      headers: {
        [APPCHECK_TOKEN_HEADER]: appcheck
          ? (await getToken(appcheck)).token
          : "",
      },
    });
  })
  .server(async ({ next }) => {
    const req = getRequest();
    const appCheckToken = req.headers.get(APPCHECK_TOKEN_HEADER);

    if (!appCheckToken) {
      throw new Error("[appcheck middleware]: Missing AppCheck token");
    }

    try {
      const appCheckClaims = await admin.appCheck().verifyToken(appCheckToken);

      return next({
        context: {
          appCheckClaims,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `[appcheck middleware]: Token verification failed - ${errorMessage}`,
      );
    }
  });
