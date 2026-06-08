/* TanStack Query Mutation for login pending check
https://tanstack.com/query/v5/docs/framework/react/guides/mutations */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { OnMFACallback } from "@/services/authService.client";
import { login } from "@/services/authService.client";
import { useRouter } from "@tanstack/react-router";
import { queries } from "@/queries";

type LoginInput = {
  email: string;
  password: string;
  callback: OnMFACallback;
};

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ email, password, callback }: LoginInput) => {
      return await login(email, password, callback);
    },
    onSuccess: async (data) => {
      await queryClient.setQueryData(queries.session.verify.queryKey, data);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(queries.session.verify);
      await router.invalidate();
    },
  });
}
