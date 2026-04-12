import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  getProfilesForStorefront,
  getActiveDrive,
} from "@/server/functions/storefront";
import { getStorefrontChildById } from "@/server/functions/child";

export const storefrontQueries = createQueryKeys("storefront", {
  profilesForDrive: (driveId: string) => ({
    queryKey: ["profilesForDrive", driveId],
    queryFn: () => getProfilesForStorefront({ data: { driveId } }),
  }),
  childById: (childId: string) => ({
    queryKey: ["childById", childId],
    queryFn: () => getStorefrontChildById({ data: { childId } }),
  }),
  activeDrive: {
    queryKey: ["activeDrive"],
    queryFn: () => getActiveDrive(),
  },
});
