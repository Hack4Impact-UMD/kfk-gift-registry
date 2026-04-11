import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { getChildProfilesForFamily } from "@/server/functions/child";

export function useChildProfilesForFamily(familyId: string) {
  return useQuery({
    ...queries.children.byFamilyId(familyId),
    queryFn: () => getChildProfilesForFamily({ data: { familyId } }),
    enabled: familyId.length > 0,
  });
}
