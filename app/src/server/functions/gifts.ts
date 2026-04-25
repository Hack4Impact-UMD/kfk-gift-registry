/* Backend server functions relating to published gifts (per specific giftDrive) */
import { createServerFn } from "@tanstack/react-start";
import { requireRolesMiddleware } from "@/server/middleware/authMiddleware";
import { UserRole } from "common";

export const getPublishedGifts = createServerFn({ method: "GET" })
    .middleware([requireRolesMiddleware([UserRole.DIRECTOR || UserRole.ADMIN])]) // no specific "staff" role so I'm reffering it to either be director or admin

export const getPublishedGiftsTableRows = createServerFn({ method: "GET" });