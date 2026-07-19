import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GiftDriveUpdate } from "common";
import { updateGiftDrive } from "@/server/functions/giftDrive";
import { toast } from "@/lib/toast";
import { queries } from "@/queries";

export function useUpdateGiftDrive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GiftDriveUpdate) => updateGiftDrive({ data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queries.drives._def,
      });
      toast.success("Gift drive updated");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update gift drive: ${message}`);
    },
  });
}
