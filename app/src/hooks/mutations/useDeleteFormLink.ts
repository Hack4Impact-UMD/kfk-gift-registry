import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFormLink } from "@/server/functions/formLinks";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";

export function useDeleteFormLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFormLink({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queries.formLinks._def,
      });
      toast.success("Form link deleted");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to delete form link: ${message}`);
    },
  });
}
