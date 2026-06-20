import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useStorefrontFormLink() {
  return useQuery(queries.formLinks.storefront);
}
