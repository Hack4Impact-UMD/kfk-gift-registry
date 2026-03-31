import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { getFamilyByToken } from "@/server/functions/family";

export function useFamilyFromLink(linkToken: string) {
  const token = linkToken.trim();

  return useQuery({
    ...queries.familyLinks.fromToken(token),
    queryFn: () => getFamilyByToken({ data: { token } }),
    enabled: token.length > 0,
  });
}
