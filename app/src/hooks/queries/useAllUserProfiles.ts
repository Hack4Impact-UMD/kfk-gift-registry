import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { getAllUserProfiles } from "@/server/functions/profile";

export function useAllUserProfiles() {
  return useQuery({
    ...queries.users.all,
    queryFn: () => getAllUserProfiles(),
  });
}
