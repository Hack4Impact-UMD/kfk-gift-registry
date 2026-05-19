import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useDonorCommittedChildren() {
  return useQuery(queries.donor.home);
}
