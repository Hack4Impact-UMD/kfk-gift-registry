import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useFamilyNotifications(
  familyId: string | undefined,
  token: string | undefined,
  driveId: string | undefined,
) {
  return useQuery({
    ...queries.notifications.family(familyId ?? "", token ?? "", driveId ?? ""),
    enabled: !!familyId && !!token && !!driveId,
  });
}
