import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useStorefrontChildProfiles(driveId: string) {
  return useQuery({
    ...queries.storefront.profilesForDrive(driveId),
    enabled: driveId.length > 0,
  });
}
