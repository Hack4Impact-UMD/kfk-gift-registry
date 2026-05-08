import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useFamilyLinkByFamilyId(familyId: string) {
  return useQuery({
    ...queries.familyLinks.byFamilyId(familyId),
    enabled: familyId.length > 0,
  });
}
