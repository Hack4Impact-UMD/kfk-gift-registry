import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useGiftsForChild(childId: string) {
  return useQuery({
    ...queries.storefront.giftsForChild(childId),
    enabled: childId.length > 0,
  });
}
