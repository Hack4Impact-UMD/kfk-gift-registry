import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markDonorNotificationAsRead } from "@/server/functions/donor";
import { queries } from "@/queries";

export function useMarkDonorNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notificationId,
      driveId,
    }: {
      notificationId: string;
      driveId: string;
    }) => markDonorNotificationAsRead({ data: { notificationId, driveId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
    },
  });
}
