import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFamily } from "@/server/functions/family";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";

export function useUpdateFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
        familyId: string;
        updates: {
            contactName?: string;
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

    onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
            queryKey: queries.families.byId(variables.familyId).queryKey,
        });

        queryClient.invalidateQueries({
            queryKey: queries.children.byFamilyId(variables.familyId).queryKey,
        });

        queryClient.invalidateQueries({
            queryKey: ["approvedProfileTableRows"],
        });

        toast.success("Family information updated successfully");
    },

    onError: (error) => {
        toast.error(`Failed to update family: ${error.message}`);
    },
  });
}
