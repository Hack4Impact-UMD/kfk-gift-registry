import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { getChildById } from "@/server/functions/child";

export function useChild(childId: string) {
  return useQuery({
    ...queries.children.byId(childId),
    queryFn: () => getChildById({ data: { childId } }),
    enabled: childId.length > 0,
  });
}
