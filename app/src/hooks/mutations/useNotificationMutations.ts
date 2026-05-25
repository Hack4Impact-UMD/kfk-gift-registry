import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markNotificationAsRead,
  clearAllNotifications,
} from "@/server/functions/notifications";

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      return await markNotificationAsRead({ data: { notificationId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyNotifications"] });
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (familyId: string) => {
      return await clearAllNotifications({ data: { familyId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyNotifications"] });
    },
  });
}
