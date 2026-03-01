import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserProfile } from "@/server/functions/profile";
import { queries } from "@/queries";

export function useDeleteUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string }) =>
      deleteUserProfile({ data: params }),
    onSuccess: (_data, variables) => {
      // Remove the deleted user from cache and invalidate all users list
      queryClient.removeQueries({ queryKey: queries.users.id(variables.userId).queryKey });
      queryClient.invalidateQueries({ queryKey: queries.users.all.queryKey });
    },
  });
}
