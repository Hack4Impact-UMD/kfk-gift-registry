import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FormLink } from "common";
import { updateFormLink } from "@/server/functions/formLinks";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";

export function useUpdateFormLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<FormLink> & Pick<FormLink, "id">) =>
      updateFormLink({ data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queries.formLinks._def,
      });
      toast.success("Form link updated");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update form link: ${message}`);
    },
  });
}
