import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { getFamilyByToken } from "@/server/family";

export function useFamilyFromLink(linkToken: string) {
  return useQuery({
    ...queries.familyLinks.fromToken(linkToken),
    queryFn: () => getFamilyByToken({ data: { token: linkToken } }),
  });
}
