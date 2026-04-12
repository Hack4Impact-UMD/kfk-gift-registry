import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useAllUserProfiles() {
  return useQuery(queries.users.all);
}
