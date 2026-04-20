import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useStorefrontChild(childId: string) {
  return useQuery({
    ...queries.storefront.childById(childId),
    enabled: childId.length > 0,
  });
}
