import {
  getChildById,
  getChildGiftsByChildId,
  getChildProfilesForFamily,
} from "@/server/functions/child";
import { getFamilyById } from "@/server/functions/family";

export function childByIdQueryOptions(childId: string) {
  return {
    queryKey: ["children-coll", "id", childId] as const,
    queryFn: async () => {
      const c = await getChildById({ data: { childId } });
      return c ? [c] : [];
    },
  };
}

export function childrenByFamilyIdQueryOptions(familyId: string) {
  return {
    queryKey: ["children-coll", "family", familyId] as const,
    queryFn: () => getChildProfilesForFamily({ data: { familyId } }),
  };
}

export function giftsByChildIdQueryOptions(childId: string) {
  return {
    queryKey: ["gifts-coll", "child", childId] as const,
    queryFn: () => getChildGiftsByChildId({ data: { childId } }),
  };
}

export function familyByIdQueryOptions(familyId: string) {
  return {
    queryKey: ["families-coll", "id", familyId] as const,
    queryFn: async () => {
      const f = await getFamilyById({ data: { familyId } });
      return f ? [f] : [];
    },
  };
}
