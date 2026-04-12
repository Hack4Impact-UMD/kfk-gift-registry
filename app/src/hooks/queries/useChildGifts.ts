import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useChildGifts(childId: string) {
  return useQuery({
    ...queries.children.gifts(childId),
    enabled: childId.length > 0,
  });
}
