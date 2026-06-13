import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useDonorCommittedChildren(driveId: string) {
  return useQuery(queries.donor.home(driveId));
}
