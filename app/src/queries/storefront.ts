import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  getProfilesForStorefront,
  getActiveDrive,
} from "@/server/functions/storefront";

export const storefrontQueries = createQueryKeys("storefront", {
  profilesForDrive: (driveId: string) => ({
    queryKey: ["profilesForDrive", driveId],
    queryFn: () => getProfilesForStorefront({ data: { driveId } }),
  }),
  activeDrive: {
    queryKey: ["activeDrive"],
    queryFn: () => getActiveDrive(),
  },
});
