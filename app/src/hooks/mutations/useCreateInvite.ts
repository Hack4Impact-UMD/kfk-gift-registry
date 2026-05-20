import { useMutation } from "@tanstack/react-query";
import type { UserRole } from "common";
import { createStaffInvite } from "@/server/functions/invite";
import { toast } from "@/lib/toast";

export function useCreateInvite() {
  return useMutation({
    mutationFn: (params: {
      name: string;
      email: string;
      role: UserRole.DIRECTOR | UserRole.ADMIN | UserRole.VOLUNTEER;
    }) => createStaffInvite({ data: params }),
    onSuccess: () => {
      toast.success("Invitation sent successfully");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to send invitation: ${message}`);
    },
  });
}
