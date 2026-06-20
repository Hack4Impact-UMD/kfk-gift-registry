import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FormLink } from "common";
import { createFormLink } from "@/server/functions/formLinks";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";

export function useCreateFormLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<FormLink, "id">) =>
      createFormLink({ data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queries.formLinks._def,
      });
      toast.success("Form link created");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to create form link: ${message}`);
    },
  });
}
