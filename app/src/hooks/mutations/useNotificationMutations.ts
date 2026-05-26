import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markNotificationAsRead,
  clearAllNotifications,
} from "@/server/functions/notifications";

export function useMarkNotificationAsRead(token: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!token) throw new Error("No family token available");
      return await markNotificationAsRead({ data: { notificationId, token } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyNotifications"] });
    },
  });
}

export function useClearAllNotifications(
  familyId: string | undefined,
  token: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!familyId || !token) throw new Error("Missing family info");
      return await clearAllNotifications({ data: { familyId, token } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyNotifications"] });
    },
  });
}
