import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { STOREFRONT_STALE_TIME_MS } from "@/queries/storefront";

export function useStorefrontStats(driveId?: string) {
  return useQuery({
    ...queries.storefront.statsForDrive(driveId ?? ""),
    enabled: !!driveId,
    staleTime: STOREFRONT_STALE_TIME_MS,
  });
}
