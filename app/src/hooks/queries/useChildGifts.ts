import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { getChildGiftsByChildId } from "@/server/functions/child";

export function useChildGifts(childId: string) {
  return useQuery({
    ...queries.children.gifts(childId),
    queryFn: () => getChildGiftsByChildId({ data: { childId } }),
    enabled: childId.length > 0,
  });
}
