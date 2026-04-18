import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/services/authService.client";
import { queries } from "@/queries";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      return await logout();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(queries.session.verify);
      await router.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to logout!");
      console.error("Logout failed:");
      console.error(err);
    },
  });
}
