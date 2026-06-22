import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  getChildProfileTableRows,
  getChildById,
  getChildGiftDetailsByChildId,
  getChildGiftsByChildId,
  getChildProfilesForFamily,
  getFamilyChildDataByToken,
} from "@/server/functions/child";

export const childQueries = createQueryKeys("children", {
  approvedProfileTableRows: (driveId: string) => ({
    queryKey: ["approvedProfileTableRows", driveId],
    queryFn: () => getChildProfileTableRows({ data: { driveId } }),
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
  giftDetails: (childId: string) => ({
    queryKey: ["giftDetails", childId],
    queryFn: () => getChildGiftDetailsByChildId({ data: { childId } }),
  }),
  familyDetailsByToken: (token: string, childId: string) => ({
    queryKey: ["familyDetailsByToken", token, childId],
    queryFn: () => getFamilyChildDataByToken({ data: { token, childId } }),
  }),
});
