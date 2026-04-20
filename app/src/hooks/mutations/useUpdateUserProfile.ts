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
    onSuccess: async (_data) => {
      // Invalidate the specific user profile and all users list
      await queryClient.invalidateQueries({ queryKey: queries.users._def });
      await queryClient.invalidateQueries(queries.session.verify);
    },
  });
}
