import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useFamilyLink(linkToken: string) {
  const token = linkToken.trim();

  return useQuery({
    ...queries.familyLinks.byToken(token),
    enabled: token.length > 0,
  });
}
