import {
  getPublishedGifts
} from "@/server/functions/gifts";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const giftDriveQueries = createQueryKeys("drives", {
  id: (driveId: string) => ({
    queryKey: ["id", driveId],
    queryFn: () => getPublishedGifts({ data: { driveId } }),
  }), // next query call will be for getPublishedGiftsTableRows
});
