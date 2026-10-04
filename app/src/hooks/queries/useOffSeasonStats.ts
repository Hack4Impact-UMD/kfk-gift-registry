import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useOffSeasonStats(driveId?: string) {
  return useQuery({
    ...queries.storefront.offSeasonStatsForDrive(driveId ?? ""),
    enabled: !!driveId,
  });
}
