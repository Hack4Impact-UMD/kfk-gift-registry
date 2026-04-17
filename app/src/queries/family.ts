import { createQueryKeys } from "@lukemorales/query-key-factory";
import { getFamilyById, getProfileTableRows } from "@/server/functions/family";

export const familyQueries = createQueryKeys("families", {
  byId: (familyId: string) => ({
    queryKey: ["byId", familyId],
    queryFn: () => getFamilyById({ data: { familyId } }),
  }),
  profileTableRows: (driveId: string) => ({
    queryKey: ["profileTableRows", driveId],
    queryFn: () => getProfileTableRows({ data: { driveId } }),
  }),
});
