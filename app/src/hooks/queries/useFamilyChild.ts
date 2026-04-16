import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useFamilyChild(token: string, childId: string) {
  const normalizedToken = token.trim();
  const normalizedChildId = childId.trim();

  return useQuery({
    ...queries.children.familyDetailsByToken(
      normalizedToken,
      normalizedChildId,
    ),
    staleTime: 2 * 60 * 1000,
    enabled: normalizedToken.length > 0 && normalizedChildId.length > 0,
  });
}
