import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useAllFormLinks() {
  return useQuery(queries.formLinks.all);
}
