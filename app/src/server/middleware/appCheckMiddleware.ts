import { createMiddleware } from "@tanstack/react-start";
import admin from "firebase-admin";

export const appCheckMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next, data }) => {
    let appCheckToken: string | undefined;

    if (typeof data === "object" && data !== null) {
      appCheckToken = (data as Record<string, unknown>).appCheckToken as
        | string
        | undefined;
    }

    if (!appCheckToken) {
      throw new Error("[appcheck middleware]: Missing AppCheck token");
    }

    try {
      const appCheckClaims = await admin
        .appCheck()
        .verifyToken(appCheckToken);

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
  },
);
