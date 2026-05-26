import { useQuery } from "@tanstack/react-query";
import { getFamilyNotifications } from "@/server/functions/notifications";

export function useFamilyNotifications(
  familyId: string | undefined,
  token: string | undefined,
) {
  return useQuery({
    queryKey: ["familyNotifications", familyId, token],
    queryFn: async () => {
      if (!familyId || !token) return { notifications: [] };
      const result = await getFamilyNotifications({
        data: { familyId, token },
      });
      return result;
    },
    enabled: !!familyId && !!token,
  });
}
