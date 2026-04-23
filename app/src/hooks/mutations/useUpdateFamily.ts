import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFamily } from "@/server/functions/family";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";
import type { Family } from "common";

export function useUpdateFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      familyId: string;
      updates: {
        contactName?: string;
        guardianRelationship?: string;
        email?: string;
        phone?: string;
        address?: {
          street?: string;
          addressLine2?: string;
          city?: string;
          state?: string;
          zipCode?: string;
        };
        privateNotes?: string;
      };
    }) => updateFamily({ data: params }),

    onMutate: async ({ familyId, updates }) => {
      const familyQueryKey = queries.families.byId(familyId).queryKey;
      await queryClient.cancelQueries({ queryKey: familyQueryKey });

      const previousFamily = queryClient.getQueryData<Family>(familyQueryKey);

      if (previousFamily) {
        const { address: addressUpdates, ...otherUpdates } = updates;
        queryClient.setQueryData<Family>(familyQueryKey, {
          ...previousFamily,
          ...otherUpdates,
          address: addressUpdates
            ? { ...previousFamily.address, ...addressUpdates }
            : previousFamily.address,
        });
      }

      return { previousFamily };
    },

    onError: (error, { familyId }, onMutateResult) => {
      queryClient.setQueryData(
        queries.families.byId(familyId).queryKey,
        onMutateResult?.previousFamily,
      );
      toast.error(`Failed to update family: ${error.message}`);
    },

    onSuccess: () => {
      toast.success("Family information updated successfully");
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
