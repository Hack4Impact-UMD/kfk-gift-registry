import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { getFamilyById } from "@/server/functions/family";

export function useFamily(familyId: string) {
  return useQuery({
    ...queries.families.byId(familyId),
    queryFn: () => getFamilyById({ data: { familyId } }),
    enabled: familyId.length > 0,
  });
}
