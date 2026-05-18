import { registerDonor } from "@/server/functions/profile";
import { useMutation } from "@tanstack/react-query";

// Type for the donor registration input with AppCheck token
interface RegisterDonorInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export function useRegisterDonor() {
  return useMutation({
    mutationFn: async (input: RegisterDonorInput) => {
      return registerDonor({
        data: input,
      });
    },
  });
}
