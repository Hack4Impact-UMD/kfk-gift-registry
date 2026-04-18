import { verifySession } from "@/server/functions/auth";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const sessionQueries = createQueryKeys("session", {
  verify: {
    queryKey: ["verify"],
    queryFn: () =>
      verifySession(),
  },
});
