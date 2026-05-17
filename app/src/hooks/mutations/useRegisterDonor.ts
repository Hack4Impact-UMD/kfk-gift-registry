import { registerDonor } from "@/server/functions/profile";
import { useMutation } from "@tanstack/react-query";
import { getAppCheckToken } from "@/lib/firebase.client";

// Type for the donor registration input with AppCheck token
interface RegisterDonorWithAppCheckInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  appCheckToken: string;
}

export function useRegisterDonor() {
  return useMutation({
    mutationFn: async (input: Omit<RegisterDonorWithAppCheckInput, "appCheckToken">) => {
      const appCheckToken = await getAppCheckToken();
      if (!appCheckToken) {
        throw new Error(
          "Failed to get AppCheck token. Please refresh the page and try again.",
        );
      }
      return registerDonor({
        data: { ...input, appCheckToken },
      });
    },
  });
}
