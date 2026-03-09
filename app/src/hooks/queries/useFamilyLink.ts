import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { getFamilyLink } from "@/server/family";

export function useFamilyLink(linkToken: string) {
  const token = linkToken.trim();

  return useQuery({
    ...queries.familyLinks.byToken(token),
    queryFn: () => getFamilyLink({ data: { token } }),
    enabled: token.length > 0,
  });
}
