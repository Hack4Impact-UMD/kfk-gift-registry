import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { getUserProfileById } from "@/server/functions/profile";

export function useUserProfile(uid: string) {
  return useQuery({
    ...queries.users.id(uid),
    queryFn: () => getUserProfileById({ data: { uid } }),
  });
}
