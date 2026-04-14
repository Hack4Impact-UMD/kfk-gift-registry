import { createQueryKeys } from "@lukemorales/query-key-factory";
import { getProfilesForStorefront } from "@/server/functions/storefront";
import {
  getStorefrontChildById,
  getStorefrontGiftsForChild,
  getStorefrontSiblingsForChild,
} from "@/server/functions/child";

export const storefrontQueries = createQueryKeys("storefront", {
  profilesForDrive: (driveId: string) => ({
    queryKey: ["profilesForDrive", driveId],
    queryFn: () => getProfilesForStorefront({ data: { driveId } }),
  }),
  childById: (childId: string) => ({
    queryKey: ["childById", childId],
    queryFn: () => getStorefrontChildById({ data: { childId } }),
  }),
  giftsForChild: (childId: string) => ({
    queryKey: ["giftsForChild", childId],
    queryFn: () => getStorefrontGiftsForChild({ data: { childId } }),
  }),
  siblingsForChild: (childId: string) => ({
    queryKey: ["siblingsForChild", childId],
    queryFn: () => getStorefrontSiblingsForChild({ data: { childId } }),
  }),
});
