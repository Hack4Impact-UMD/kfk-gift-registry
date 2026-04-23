import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function usePendingProfileTableRows(driveId: string | null) {
  return useQuery({
    ...queries.families.profileTableRows(driveId ?? ""),
    enabled: !!driveId,
  });
}
