import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFamilyReviewStatus } from "@/server/functions/family";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";
import type { Family } from "common";

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

    onMutate: async ({ familyId, updates }) => {
      const familyKey = queries.families.byId(familyId).queryKey;
      await queryClient.cancelQueries({ queryKey: familyKey });

      const previousFamily = queryClient.getQueryData<Family>(familyKey);

      if (previousFamily) {
        queryClient.setQueryData<Family>(familyKey, {
          ...previousFamily,
          ...(updates.privateNotes !== undefined
            ? { privateNotes: updates.privateNotes }
            : {}),
          reviewStatus: {
            ...previousFamily.reviewStatus,
            ...updates.reviewStatus,
          },
        });
      }

      return { previousFamily };
    },

    onError: (error: unknown, { familyId }, onMutateResult) => {
      if (onMutateResult?.previousFamily) {
        queryClient.setQueryData(
          queries.families.byId(familyId).queryKey,
          onMutateResult.previousFamily,
        );
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update family review status: ${message}`);
    },

    onSuccess: () => {
      toast.success("Family review status updated");
    },

    onSettled: (_data, _error, { familyId }) => {
      queryClient.invalidateQueries({
        queryKey: queries.families.byId(familyId).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: queries.children.byFamilyId(familyId).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: queries.children.approvedProfileTableRows._def,
      });
    },
  });
}
