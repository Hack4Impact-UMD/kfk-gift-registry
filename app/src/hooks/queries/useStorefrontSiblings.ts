import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useStorefrontSiblings(childId: string) {
  return useQuery({
    ...queries.storefront.siblingsForChild(childId),
    enabled: childId.length > 0,
  });
}
