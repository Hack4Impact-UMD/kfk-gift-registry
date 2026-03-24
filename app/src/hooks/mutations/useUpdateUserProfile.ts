import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "@/server/functions/profile";
import { queries } from "@/queries";

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      userId: string;
      updates: { name?: string; phone?: string };
    }) => updateUserProfile({ data: params }),
    onSuccess: (_data, variables) => {
      // Invalidate the specific user profile and all users list
      queryClient.invalidateQueries({
        queryKey: queries.users.id(variables.userId).queryKey,
      });
      queryClient.invalidateQueries({ queryKey: queries.users.all.queryKey });
      queryClient.invalidateQueries({ queryKey: queries.users.me.queryKey });
    },
  });
}
