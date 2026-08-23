import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useDonorNotifications(
  driveId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...queries.donor.notifications(driveId),
    enabled: options?.enabled,
  });
}
