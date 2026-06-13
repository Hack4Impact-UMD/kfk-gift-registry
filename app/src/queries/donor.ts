import { createQueryKeys } from "@lukemorales/query-key-factory";
import { getCommittedChildrenForDonor } from "@/server/functions/donor";

export const donorQueries = createQueryKeys("donor", {
  home: (driveId: string) => ({
    queryKey: ["home", driveId],
    queryFn: () => getCommittedChildrenForDonor({ data: { driveId } }),
  }),
});
