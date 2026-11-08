import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unpublishChildren } from "@/server/functions/child";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";

export function useUnpublishChildren() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (childIds: Array<string>) =>
      unpublishChildren({ data: childIds as [string, ...Array<string>] }),

    onSuccess: async (_data, childIds) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["children-coll"] }),
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

      toast.success(
        childIds.length === 1
          ? "Profile unpublished"
          : `${childIds.length} profiles unpublished`,
      );
    },

    onError: (error) => {
      toast.error(`Failed to unpublish profiles: ${error.message}`);
    },
  });
}
