/* Backend server functions relating to published gifts (per specific giftDrive) */
import { createServerFn } from "@tanstack/react-start";
import { requireRolesMiddleware } from "@/server/middleware/authMiddleware";
import { UserRole } from "common";
import z from "zod";
import { getServerDB } from "@/lib/firebase.server";

const driveIdSchema = z.object({ // param for both functions
    driveId: z.string()
});

export const getPublishedGifts = createServerFn({ method: "GET" })
    .middleware([requireRolesMiddleware([UserRole.DIRECTOR || UserRole.ADMIN])]) // no specific "staff" role so I'm reffering it to either be director or admin
    .inputValidator(driveIdSchema)
    .handler(async ({ data }) => {
        const db  = getServerDB();
    })

export const getPublishedGiftsTableRows = createServerFn({ method: "GET" });