import { createQueryKeys } from "@lukemorales/query-key-factory";

export const familyLinkQueries = createQueryKeys("familyLinks", {
  fromToken: (token: string) => ["fromToken", token],
  byToken: (token: string) => ["byToken", token],
});
