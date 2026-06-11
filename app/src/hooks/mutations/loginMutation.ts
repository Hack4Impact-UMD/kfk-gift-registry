/* TanStack Query Mutation for login pending check
https://tanstack.com/query/v5/docs/framework/react/guides/mutations */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { OnMFACallback } from "@/services/authService.client";
import { login } from "@/services/authService.client";
import { queries } from "@/queries";

type LoginInput = {
  email: string;
  password: string;
  callback: OnMFACallback;
};

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password, callback }: LoginInput) => {
      return await login(email, password, callback);
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(queries.session.verify.queryKey, data);
    },
    onSettled: async () => {
      queryClient.invalidateQueries(queries.session.verify);
    },
  });
}
