import { createQueryKeys } from "@lukemorales/query-key-factory";

export const childQueries = createQueryKeys("children", {
  approvedProfileTableRows: (driveId: string) => [
    "approvedProfileTableRows",
    driveId,
  ],
  byFamilyId: (familyId: string) => ["byFamilyId", familyId],
  byId: (childId: string) => ["byId", childId],
  gifts: (childId: string) => ["gifts", childId],
});
