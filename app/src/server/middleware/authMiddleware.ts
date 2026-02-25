import { createMiddleware } from "@tanstack/react-start";
import { verifySession } from "../auth";
import type { UserRole } from "common";

export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const authUser = await verifySession();
    if (authUser) {
      return next({
        context: {
          authUser: authUser,
        },
      });
    } else {
      throw new Error("[auth middleware]: Not authenticated");
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
        throw new Error(`[role middleware]: invalid roles`)
      }
    });
