import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useChildGiftDetails(childId: string) {
  return useQuery({
    ...queries.children.giftDetails(childId),
    enabled: childId.length > 0,
  });
}
