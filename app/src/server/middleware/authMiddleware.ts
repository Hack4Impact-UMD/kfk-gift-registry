import { logger } from "@sentry/tanstackstart-react";
import { createMiddleware } from "@tanstack/react-start";
import type { UserRole } from "common";
import { verifySession } from "@/server/functions/auth";
import { UnauthenticatedError } from "@/lib/errors";

export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const authUser = await verifySession({ data: { checkRevocation: true } });
    if (authUser) {
      return next({
        context: {
          authUser: authUser,
        },
      });
    } else {
      logger.warn("Rejected unauthenticated server function call");
      throw new UnauthenticatedError();
    }
  },
);

export const requireRolesMiddleware = (allowedRoles: Array<UserRole>) =>
  createMiddleware({ type: "function" })
    .middleware([authMiddleware])
    .server(async ({ context, next }) => {
      if (allowedRoles.includes(context.authUser.role)) {
        return next();
      } else {
        logger.warn("Rejected server function call: insufficient role", {
          userId: context.authUser.uid,
          role: context.authUser.role,
          allowedRoles: allowedRoles.join(","),
        });
        throw new Error(`[role middleware]: invalid roles`);
      }
    });
