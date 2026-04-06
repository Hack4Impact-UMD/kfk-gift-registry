import { createQueryKeys } from "@lukemorales/query-key-factory";

export const familyQueries = createQueryKeys("families", {
  byId: (familyId: string) => ["byId", familyId],
});
