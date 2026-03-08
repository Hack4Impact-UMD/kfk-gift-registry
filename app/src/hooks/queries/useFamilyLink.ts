import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { getFamilyLink } from "@/server/family";

export function useFamilyLink(linkToken: string) {
  return useQuery({
    ...queries.familyLinks.byToken(linkToken),
    queryFn: () => getFamilyLink({ data: { token: linkToken } }),
  });
}
