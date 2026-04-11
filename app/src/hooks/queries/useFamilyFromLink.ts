import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useFamilyFromLink(linkToken: string) {
  const token = linkToken.trim();

  return useQuery({
    ...queries.familyLinks.fromToken(token),
    enabled: token.length > 0,
  });
}
