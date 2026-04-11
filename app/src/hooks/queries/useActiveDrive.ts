import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useActiveDrive() {
  return useQuery(queries.storefront.activeDrive);
}
