import { useQuery } from "@tanstack/react-query";
import publishedGiftsQueries from "@/queries/publishedGifts";

export function useAdminDashboardMetrics(driveId: string | null) {
  return useQuery({
    ...publishedGiftsQueries.dashboardMetrics(driveId ?? ""),
    enabled: !!driveId,
  });
}
