import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useStorefrontStats(driveId?: string) {
  return useQuery({
    ...queries.storefront.statsForDrive(driveId ?? ""),
    enabled: !!driveId,
  });
}
