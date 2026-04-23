import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateChild } from "@/server/functions/child";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";
import type { Child } from "common";

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

    onMutate: async ({ childId, updates }) => {
      const childKey = queries.children.byId(childId).queryKey;
      const familyChildrenPartialKey = queries.children.byFamilyId._def;

      await Promise.all([
        queryClient.cancelQueries({ queryKey: childKey }),
        queryClient.cancelQueries({ queryKey: familyChildrenPartialKey }),
      ]);

      const previousChild = queryClient.getQueryData<Child>(childKey);
      const previousFamilyChildren = queryClient.getQueriesData<Array<Child>>({
        queryKey: familyChildrenPartialKey,
      });

      if (previousChild) {
        queryClient.setQueryData<Child>(childKey, {
          ...previousChild,
          ...updates,
        });
      }

      queryClient.setQueriesData<Array<Child>>(
        { queryKey: familyChildrenPartialKey },
        (data) =>
          data?.map((c) => (c.id === childId ? { ...c, ...updates } : c)) ??
          data,
      );

      return { previousChild, previousFamilyChildren };
    },

    onError: (error, { childId }, onMutateResult) => {
      if (onMutateResult) {
        queryClient.setQueryData(
          queries.children.byId(childId).queryKey,
          onMutateResult.previousChild,
        );
        for (const [key, data] of onMutateResult.previousFamilyChildren) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error(`Failed to update child: ${error.message}`);
    },

    onSuccess: () => {
      toast.success("Child profile updated successfully");
    },

    onSettled: (_data, _error, { childId }) => {
      queryClient.invalidateQueries({
        queryKey: queries.children.byId(childId).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: queries.children.gifts(childId).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: queries.children.byFamilyId._def,
      });

      queryClient.invalidateQueries({
        queryKey: queries.children.approvedProfileTableRows._def,
      });
    },
  });
}
