import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useDonorNotifications(driveId: string) {
  return useQuery(queries.donor.notifications(driveId));
}
