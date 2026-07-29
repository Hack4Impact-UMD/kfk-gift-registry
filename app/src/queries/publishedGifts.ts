import {
  getPublishedGifts,
  getPublishedGiftsTableRows,
  getAdminDashboardMetrics,
} from "@/server/functions/gifts";
import { getStaffGiftClaimDetails } from "@/server/functions/staffClaim";
import { createQueryKeys } from "@lukemorales/query-key-factory";

const publishedGiftsQueries = createQueryKeys("publishedGifts", {
  byDrive: (driveId: string) => ({
    queryKey: ["byDrive", driveId],
    queryFn: () => getPublishedGifts({ data: { driveId } }),
  }),
  tableRowsByDrive: (driveId: string) => ({
    queryKey: ["tableRowsByDrive", driveId],
    queryFn: () => getPublishedGiftsTableRows({ data: { driveId } }),
  }),
  claimDetailsByGift: (giftId: string) => ({
    queryKey: ["claimDetailsByGift", giftId],
    queryFn: () => getStaffGiftClaimDetails({ data: { giftId } }),
  }),
  dashboardMetrics: (driveId: string) => ({
    queryKey: ["dashboardMetrics", driveId],
    queryFn: () => getAdminDashboardMetrics({ data: { driveId } }),
  }),
});

export default publishedGiftsQueries;
