import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useChild(childId: string) {
  return useQuery({
    ...queries.children.byId(childId),
    enabled: childId.length > 0,
  });
}
