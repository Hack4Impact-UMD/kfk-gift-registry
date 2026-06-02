import { createQueryKeys } from "@lukemorales/query-key-factory";
import { getFamilyNotifications } from "@/server/functions/notifications";

export const notificationQueries = createQueryKeys("notifications", {
  family: (familyId: string, token: string, driveId: string) => ({
    queryKey: [familyId, token, driveId],
    queryFn: () =>
      getFamilyNotifications({ data: { familyId, token, driveId } }),
  }),
});
