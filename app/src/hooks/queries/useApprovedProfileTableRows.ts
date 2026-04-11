import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useApprovedProfileTableRows(driveId: string | null) {
  return useQuery({
    ...queries.children.approvedProfileTableRows(driveId ?? ""),
    enabled: !!driveId,
  });
}
