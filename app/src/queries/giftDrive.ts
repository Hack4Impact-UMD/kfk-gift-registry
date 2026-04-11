import {
  getActiveGiftDrive,
  getAllGiftDrives,
  getGiftDriveById,
} from "@/server/functions/giftDrive";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const giftDriveQueries = createQueryKeys("drives", {
  all: {
    queryKey: ["all"],
    queryFn: () => getAllGiftDrives(),
  },
  id: (id: string) => ({
    queryKey: ["id", id],
    queryFn: () => getGiftDriveById({ data: { id } }),
  }),
  active: {
    queryKey: ["active"],
    queryFn: () => getActiveGiftDrive(),
  },
});
