import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateGiftDrive } from "@/server/functions/giftDrive";
import { toast } from "@/lib/toast";
import { queries } from "@/queries";

export function useDeactivateGiftDrive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateGiftDrive({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queries.drives._def,
      });
      toast.success("Gift drive deactivated");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to deactivate gift drive: ${message}`);
    },
  });
}
