import { createQueryKeys } from "@lukemorales/query-key-factory";

export const userProfileQueries = createQueryKeys("users", {
  all: ["all"],
  me: ["me"],
  id: (uid: string) => ["id", uid],
});
