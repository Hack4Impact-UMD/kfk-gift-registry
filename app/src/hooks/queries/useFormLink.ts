import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useFormLink(id: string) {
  return useQuery(queries.formLinks.id(id));
}
