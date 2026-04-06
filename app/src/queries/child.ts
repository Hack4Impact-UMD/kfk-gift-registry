import { createQueryKeys } from "@lukemorales/query-key-factory";

export const childQueries = createQueryKeys("children", {
  approvedProfileTableRows: (driveId: string) => [
    "approvedProfileTableRows",
    driveId,
  ],
});
