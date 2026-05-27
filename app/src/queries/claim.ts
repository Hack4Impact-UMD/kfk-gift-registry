import { createQueryKeys } from "@lukemorales/query-key-factory";
import { getClaimsWithDonorByChildId } from "@/server/functions/child";

export const claimQueries = createQueryKeys("claims", {
  byChildId: (childId: string) => ({
    queryKey: ["byChildId", childId],
    queryFn: () => getClaimsWithDonorByChildId({ data: { childId } }),
  }),
});
