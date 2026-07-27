import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveFamilies } from "@/server/functions/family";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";

export function useApproveFamilies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (familyIds: Array<string>) =>
      approveFamilies({ data: familyIds }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queries.families.profileTableRows._def,
        }),
        queryClient.invalidateQueries({
          queryKey: queries.children.approvedProfileTableRows._def,
        }),
      ]);

      toast.success("Families moved to approved");
    },

    onError: (error) => {
      toast.error(`Failed to approve families: ${error.message}`);
    },
  });
}
