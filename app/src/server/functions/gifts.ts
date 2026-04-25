/* Backend server functions relating to published gifts (per specific giftDrive) */
import { createServerFn } from "@tanstack/react-start";

export const getPublishedGifts = createServerFn({ method: "GET" });
export const getPublishedGiftsTableRows = createServerFn({ method: "GET" });