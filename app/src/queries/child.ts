import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  getApprovedProfileTableRows,
  getChildById,
  getChildGiftsByChildId,
  getChildProfilesForFamily,
} from "@/server/functions/child";

export const childQueries = createQueryKeys("children", {
  approvedProfileTableRows: (driveId: string) => ({
    queryKey: ["approvedProfileTableRows", driveId],
    queryFn: () => getApprovedProfileTableRows({ data: { driveId } }),
  }),
  byFamilyId: (familyId: string) => ({
    queryKey: ["byFamilyId", familyId],
    queryFn: () => getChildProfilesForFamily({ data: { familyId } }),
  }),
  byId: (childId: string) => ({
    queryKey: ["byId", childId],
    queryFn: () => getChildById({ data: { childId } }),
  }),
  gifts: (childId: string) => ({
    queryKey: ["gifts", childId],
    queryFn: () => getChildGiftsByChildId({ data: { childId } }),
  }),
});
