import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GiftDriveInput } from "common";
import { createGiftDrive } from "@/server/functions/giftDrive";
import { toast } from "@/lib/toast";
import { queries } from "@/queries";

export function useCreateGiftDrive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GiftDriveInput) => createGiftDrive({ data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queries.drives._def,
      });
      toast.success("Gift drive created");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to create gift drive: ${message}`);
    },
  });
}
