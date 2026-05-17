import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publishFamilies } from "@/server/functions/family";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";

export function usePublishFamilies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (familyIds: Array<string>) =>
      publishFamilies({ data: familyIds }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queries.children.byFamilyId._def,
        }),
        queryClient.invalidateQueries({
          queryKey: queries.children.approvedProfileTableRows._def,
        }),
        queryClient.invalidateQueries({
          queryKey: queries.families.profileTableRows._def,
        }),
        queryClient.invalidateQueries({
          queryKey: queries.storefront._def,
        }),
      ]);

      toast.success("Families published to storefront");
    },

    onError: (error) => {
      toast.error(`Failed to publish families: ${error.message}`);
    },
  });
}
