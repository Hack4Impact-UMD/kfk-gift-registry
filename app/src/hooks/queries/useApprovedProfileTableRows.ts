import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { getApprovedProfileTableRows } from "@/server/functions/child";

export function useApprovedProfileTableRows(driveId: string) {
  return useQuery({
    ...queries.children.approvedProfileTableRows(driveId),
    queryFn: () => getApprovedProfileTableRows({ data: { driveId } }),
  });
}
