import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { getCurrentUserProfile } from "@/server/auth";

export function useCurrentUserProfile() {
  return useQuery({
    ...queries.users.me,
    queryFn: () => getCurrentUserProfile()
  })
}
