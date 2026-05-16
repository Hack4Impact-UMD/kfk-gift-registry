import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  getActiveFamilyLinkByFamilyId,
  getFamilyByToken,
  getFamilyLink,
} from "@/server/functions/family";

export const familyLinkQueries = createQueryKeys("familyLinks", {
  fromToken: (token: string) => ({
    queryKey: ["fromToken", token],
    queryFn: () => getFamilyByToken({ data: { token } }),
  }),
  byToken: (token: string) => ({
    queryKey: ["byToken", token],
    queryFn: () => getFamilyLink({ data: { token } }),
  }),
  byFamilyId: (familyId: string) => ({
    queryKey: ["byFamilyId", familyId],
    queryFn: () => getActiveFamilyLinkByFamilyId({ data: { familyId } }),
  }),
});
