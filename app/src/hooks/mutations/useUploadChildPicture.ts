import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadChildPicture } from "@/server/functions/child";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";

export function useUploadChildPicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { childId: string; dataUrl: string }) =>
      uploadChildPicture({ data: params }),

    onError: (error) => {
      toast.error(`Failed to upload photo: ${error.message}`);
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
