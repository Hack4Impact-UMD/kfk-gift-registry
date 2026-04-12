import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  getProfilesForStorefront,
  getActiveDrive,
} from "@/server/functions/storefront";
import {
  getStorefrontChildById,
  getGiftsForChild,
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
    queryFn: () => getGiftsForChild({ data: { childId } }),
  }),
  siblingsForChild: (childId: string) => ({
    queryKey: ["siblingsForChild", childId],
    queryFn: () => getStorefrontSiblingsForChild({ data: { childId } }),
  }),
  activeDrive: {
    queryKey: ["activeDrive"],
    queryFn: () => getActiveDrive(),
  },
});
