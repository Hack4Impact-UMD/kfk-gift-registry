import { createQueryKeys } from "@lukemorales/query-key-factory";
import { getFamilyById } from "@/server/functions/family";

export const familyQueries = createQueryKeys("families", {
  byId: (familyId: string) => ({
    queryKey: ["byId", familyId],
    queryFn: () => getFamilyById({ data: { familyId } }),
  }),
});
