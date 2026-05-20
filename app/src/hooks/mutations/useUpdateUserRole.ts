import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserRole } from "common";
import { updateUserRole } from "@/server/functions/profile";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      userId: string;
      role: UserRole.DIRECTOR | UserRole.ADMIN | UserRole.VOLUNTEER;
    }) => updateUserRole({ data: params }),
    onSuccess: () => {
      toast.success("Role updated successfully");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update role: ${message}`);
    },
    onSettled: (_data, _error, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: queries.users.id(userId).queryKey,
      });
      queryClient.invalidateQueries({ queryKey: queries.users.all.queryKey });
    },
  });
}
