import { registerStaffMemberWithInvite } from "@/server/functions/profile";
import { useMutation } from "@tanstack/react-query";

export function useRegisterStaffWithInvite() {
  return useMutation({
    mutationFn: registerStaffMemberWithInvite,
  });
}
