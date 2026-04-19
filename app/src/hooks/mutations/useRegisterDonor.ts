import { registerDonor } from "@/server/functions/profile";
import { useMutation } from "@tanstack/react-query";

export function useRegisterDonor() {
  return useMutation({
    mutationFn: registerDonor,
  });
}
