/* Backend server functions relating to published gifts (per specific giftDrive) */
import { createServerFn } from "@tanstack/react-start";
import { requireRolesMiddleware } from "@/server/middleware/authMiddleware";
import { UserRole } from "common";
import z from "zod";
import { getServerDB } from "@/lib/firebase.server";

const driveIdSchema = z.object({
  // param for both functions
  driveId: z.string(),
});

export const getPublishedGifts = createServerFn({ method: "GET" })
  .middleware([requireRolesMiddleware([UserRole.DIRECTOR, UserRole.ADMIN])]) // no specific "staff" role so I'm reffering it to either be director or admin
  .inputValidator(driveIdSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const { driveId } = data;

    const gifts = await db.gifts.where("giftDrive", "==", driveId).get();
    const thisDrivesChildren = await db.children
      .where("giftDrive", "==", driveId)
      .where("published", "==", true)
      .get();

    const childrensIds = new Set(thisDrivesChildren.docs.map((doc) => doc.id));
    const publishedGifts = gifts.docs
      .map((doc) => doc.data())
      .filter((gift) => childrensIds.has(gift.childId));

    return publishedGifts;
  });

export const getPublishedGiftsTableRows = createServerFn({ method: "GET" });
