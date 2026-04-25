import {
  getPublishedGifts
} from "@/server/functions/gifts";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const publishedGiftsQueries = createQueryKeys("publishedGifts", {
  byDrive: (driveId: string) => ({
    queryKey: ["byDrive", driveId],
    queryFn: () => getPublishedGifts({ data: { driveId } }),
  }), // next query call will be for getPublishedGiftsTableRows
});
