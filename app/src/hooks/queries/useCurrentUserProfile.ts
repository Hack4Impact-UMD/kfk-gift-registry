import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useCurrentUserProfile() {
  return useQuery(queries.users.me);
}
