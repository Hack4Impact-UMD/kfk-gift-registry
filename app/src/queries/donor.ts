import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  getCommittedChildrenForDonor,
  getDonorNotifications,
} from "@/server/functions/donor";

export const donorQueries = createQueryKeys("donor", {
  home: (driveId: string) => ({
    queryKey: ["home", driveId],
    queryFn: () => getCommittedChildrenForDonor({ data: { driveId } }),
  }),
  notifications: (driveId: string) => ({
    queryKey: ["notifications", driveId],
    queryFn: () => getDonorNotifications({ data: { driveId } }),
  }),
});
