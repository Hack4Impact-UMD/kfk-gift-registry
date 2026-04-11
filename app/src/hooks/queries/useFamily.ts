import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useFamily(familyId: string) {
  return useQuery({
    ...queries.families.byId(familyId),
    enabled: familyId.length > 0,
  });
}
