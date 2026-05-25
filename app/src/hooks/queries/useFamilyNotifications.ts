import { useQuery } from "@tanstack/react-query";
import { getFamilyNotifications } from "@/server/functions/notifications";

export function useFamilyNotifications(familyId: string | undefined) {
  return useQuery({
    queryKey: ["familyNotifications", familyId],
    queryFn: async () => {
      if (!familyId) return { notifications: [] };
      const result = await getFamilyNotifications({ data: { familyId } });
      return result;
    },
    enabled: !!familyId,
  });
}
