/* TanStack Query Mutation for login pending check
https://tanstack.com/query/v5/docs/framework/react/guides/mutations */

import { useMutation } from "@tanstack/react-query";
import { login } from "@/services/authService.client";

type LoginInput = {
  email: string;
  password: string;
};

export function useLoginMutation() {
  return useMutation({
    mutationFn: async ({ email, password }: LoginInput) => {
      await login(email, password);
    },
  });
}
