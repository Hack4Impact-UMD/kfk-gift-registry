import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { STOREFRONT_STALE_TIME_MS } from "@/queries/storefront";

export function useStorefrontChildProfiles(driveId?: string) {
  return useQuery({
    ...queries.storefront.profilesForDrive(driveId ?? ""),
    enabled: !!driveId,
    staleTime: STOREFRONT_STALE_TIME_MS,
  });
}
