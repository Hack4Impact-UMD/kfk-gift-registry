import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFamilyReviewStatus } from "@/server/functions/family";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";

export function useUpdateFamilyReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      familyId: string;
      updates: {
        reviewStatus: {
          approved: boolean;
          held: boolean;
          reviewNotes?: string;
          holdNotes?: string;
        };
        privateNotes?: string;
      };
    }) => updateFamilyReviewStatus({ data: params }),

    onSuccess: (_data, variables) => {
      const { familyId } = variables;

      queryClient.invalidateQueries({
        queryKey: queries.families.byId(familyId).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: queries.children.byFamilyId(variables.familyId).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: ["approvedProfileTableRows"],
      });

      toast.success("Family review status updated");
    },

    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update family review status: ${message}`);
    },
  });
}
