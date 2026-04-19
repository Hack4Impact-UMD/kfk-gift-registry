import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateChild } from "@/server/functions/child";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";

export function useUpdateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      childId: string;
      updates: {
        name?: string;
        diagnosis?: string;
        hospital?: string;
        childSocialWorker?: string;
        publicBlurb?: string;
        staffPrivateNotes?: string;
        photoUrl?: string;
        age?: number;
        treatmentLevel?: number;
        diagnosisLengthYears?: "<6m" | "6m-1y" | "1-2y" | "3-4y" | "5+y";
        offTreatmentDurationYears?: "<6m" | "6m-1y" | "1-2y" | "3-4y" | "5+y";
      };
    }) => updateChild({ data: params }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queries.children.byId(variables.childId).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: queries.children.gifts(variables.childId).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: ["approvedProfileTableRows"],
      });

      toast.success("Child profile updated successfully");
    },

    onError: (error) => {
      toast.error(`Failed to update child: ${error.message}`);
    },
  });
}
