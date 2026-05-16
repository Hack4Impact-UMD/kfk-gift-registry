import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Child } from "common";
import { queries } from "@/queries";

export function useChildProfilesForFamily(
  familyId: string,
): UseQueryResult<Array<Child>> {
  return useQuery({
    ...queries.children.byFamilyId(familyId),
    enabled: familyId.length > 0,
  });
}
