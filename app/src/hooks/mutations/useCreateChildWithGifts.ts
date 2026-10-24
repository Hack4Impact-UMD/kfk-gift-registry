import { useMutation } from "@tanstack/react-query";
import { useCollections } from "@/collections/context";
import { createChildWithGifts } from "@/server/functions/child";
import type { CreateChildWithGiftsInput } from "@/server/functions/child";
import { toast } from "@/lib/toast";

type CreateChildWithGiftsVariables = CreateChildWithGiftsInput & {
  // data URL from PhotoUpload; uploaded once the child exists
  photo?: string;
};

export function useCreateChildWithGifts() {
  const collections = useCollections();

  return useMutation({
    mutationFn: async ({ photo, ...data }: CreateChildWithGiftsVariables) => {
      const { child, gifts } = await createChildWithGifts({ data });
      collections.children.utils.writeInsert(child);
      collections.gifts.utils.writeInsert(gifts);

      if (photo) {
        // persistChildUpdate uploads data URLs to the child's photo path. The
        // child already exists, and the collection toasts upload failures.
        const tx = collections.children.update(child.id, (draft) => {
          draft.photoUrl = photo;
        });
        await tx.isPersisted.promise.catch(() => undefined);
      }

      await Promise.all([
        collections.invalidateChildDerivedCaches(),
        collections.invalidateGiftDerivedCaches(),
      ]);
      return child;
    },
    onSuccess: (child) => {
      toast.success(`Added ${child.name}`);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to add child: ${message}`);
    },
  });
}
