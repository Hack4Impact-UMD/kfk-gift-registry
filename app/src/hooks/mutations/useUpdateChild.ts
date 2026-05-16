import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateChild } from "@/server/functions/child";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";
import type { Child } from "common";
import type { ApprovedProfileTableRow } from "@/components/tables/ApprovedProfilesTable/types";

const TOO_LONG_ERROR = "150 characters or fewer.";

function getUpdateChildErrorMessage(error: Error) {
  if (
    error.message.includes("maximum") &&
    error.message.includes("150")
  ) {
    return TOO_LONG_ERROR;
  }

  return `Failed to update child: ${error.message}`;
}

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
        published?: boolean;
        diagnosisLengthYears?: "<6m" | "6m-1y" | "1-2y" | "3-4y" | "5+y";
        offTreatmentDurationYears?: "<6m" | "6m-1y" | "1-2y" | "3-4y" | "5+y";
      };
    }) => updateChild({ data: params }),

    onMutate: async ({ childId, updates }) => {
      const childKey = queries.children.byId(childId).queryKey;
      const familyChildrenPartialKey = queries.children.byFamilyId._def;
      const approvedProfilesPartialKey =
        queries.children.approvedProfileTableRows._def;

      await Promise.all([
        queryClient.cancelQueries({ queryKey: childKey }),
        queryClient.cancelQueries({ queryKey: familyChildrenPartialKey }),
        queryClient.cancelQueries({ queryKey: approvedProfilesPartialKey }),
      ]);

      const previousChild = queryClient.getQueryData<Child>(childKey);
      const previousFamilyChildren = queryClient.getQueriesData<Array<Child>>({
        queryKey: familyChildrenPartialKey,
      });
      const previousApprovedProfiles = queryClient.getQueriesData<
        Array<ApprovedProfileTableRow>
      >({
        queryKey: approvedProfilesPartialKey,
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

      queryClient.setQueriesData<Array<ApprovedProfileTableRow>>(
        { queryKey: approvedProfilesPartialKey },
        (data) =>
          data?.map((row) =>
            row.id === childId
              ? {
                  ...row,
                  ...(updates.name !== undefined
                    ? { childName: updates.name }
                    : {}),
                  ...(updates.photoUrl !== undefined
                    ? { profilePictureUrl: updates.photoUrl }
                    : {}),
                  ...(updates.age !== undefined ? { age: updates.age } : {}),
                  ...(updates.diagnosis !== undefined
                    ? { diagnosis: updates.diagnosis }
                    : {}),
                  ...(updates.published !== undefined
                    ? { published: updates.published }
                    : {}),
                }
              : row,
          ) ?? data,
      );

      return {
        previousChild,
        previousFamilyChildren,
        previousApprovedProfiles,
      };
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
        for (const [key, data] of onMutateResult.previousApprovedProfiles) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error(getUpdateChildErrorMessage(error));
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

      queryClient.invalidateQueries({
        queryKey: queries.families.profileTableRows._def,
      });

      queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
    },
  });
}
