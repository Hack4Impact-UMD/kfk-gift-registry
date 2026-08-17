import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FamilyNotification } from "common";
import {
  markNotificationAsRead,
  clearAllNotifications,
} from "@/server/functions/notifications";
import { queries } from "@/queries";

export function useMarkNotificationAsRead(
  familyId: string | undefined,
  token: string | undefined,
  driveId: string | undefined,
) {
  const queryClient = useQueryClient();

  const queryKey = queries.notifications.family(
    familyId ?? "",
    token ?? "",
    driveId ?? "",
  ).queryKey;

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!token) throw new Error("token not found");
      return await markNotificationAsRead({ data: { notificationId, token } });
    },
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(
        queryKey,
        (old: { notifications: Array<FamilyNotification> } | undefined) =>
          old && {
            notifications: old.notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n,
            ),
          },
      );

      return { previousData };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      token,
      driveId,
    }: {
      familyId: string | undefined;
      token: string | undefined;
      driveId: string | undefined;
    }) => {
      if (!familyId || !token || !driveId)
        throw new Error("Missing family info");
      return await clearAllNotifications({
        data: { familyId, token, driveId },
      });
    },
    onSuccess: (_data, { familyId, token, driveId }) => {
      if (!familyId || !token || !driveId) {
        throw new Error("Missing family info");
      }
      queryClient.invalidateQueries(
        queries.notifications.family(familyId, token, driveId),
      );
    },
  });
}
