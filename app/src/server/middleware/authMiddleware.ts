import { createMiddleware } from "@tanstack/react-start";
import { verifySession } from "../auth";

export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const authUser = await verifySession();
  if (authUser) {
    return next({
      context: {
        authUser: authUser
      }
    })
  } else {
    throw new Error("[auth middleware]: Not authenticated");
  }
})
