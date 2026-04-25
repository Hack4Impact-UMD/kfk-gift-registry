import {
  getPublishedGifts,
  getPublishedGiftsTableRows,
} from "@/server/functions/gifts";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const publishedGiftsQueries = createQueryKeys("publishedGifts", {
  byDrive: (driveId: string) => ({
    queryKey: ["byDrive", driveId],
    queryFn: () => getPublishedGifts({ data: { driveId } }),
  }),
  tableRowsByDrive: (driveId: string) => ({
    queryKey: ["tableRowsByDrive", driveId],
    queryFn: () => getPublishedGiftsTableRows({ data: { driveId } }),
  }),
});
