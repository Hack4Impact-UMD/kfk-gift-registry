import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  getProfilesForStorefront,
  getOffSeasonStatsForDrive,
  getStorefrontStatsForDrive,
} from "@/server/functions/storefront";
import {
  getStorefrontChildById,
  getStorefrontGiftsForChild,
  getStorefrontSiblingsForChild,
} from "@/server/functions/child";

// Matches the server-side storefront cache TTL; refetching sooner would only
// return the same cached data.
export const STOREFRONT_STALE_TIME_MS = 60 * 1000;

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
  statsForDrive: (driveId: string) => ({
    queryKey: ["statsForDrive", driveId],
    queryFn: () => getStorefrontStatsForDrive({ data: { driveId } }),
  }),
  offSeasonStatsForDrive: (driveId: string) => ({
    queryKey: ["offSeasonStatsForDrive", driveId],
    queryFn: () => getOffSeasonStatsForDrive({ data: { driveId } }),
  }),
});
