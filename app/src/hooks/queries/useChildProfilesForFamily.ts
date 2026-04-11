import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useChildProfilesForFamily(familyId: string) {
  return useQuery({
    ...queries.children.byFamilyId(familyId),
    enabled: familyId.length > 0,
  });
}
