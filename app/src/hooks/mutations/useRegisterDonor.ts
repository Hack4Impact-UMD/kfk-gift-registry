import { registerDonor } from "@/server/functions/profile";
import { useMutation } from "@tanstack/react-query";

interface RegisterDonorInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export function useRegisterDonor() {
  return useMutation({
    mutationFn: async (input: RegisterDonorInput) =>
      registerDonor({
        data: input,
      }),
  });
}
