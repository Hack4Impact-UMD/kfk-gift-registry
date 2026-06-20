import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  getAllFormLinks,
  getFormLinkById,
  getStorefrontFormLink,
} from "@/server/functions/formLinks";

export const formLinkQueries = createQueryKeys("formLinks", {
  all: {
    queryKey: ["all"],
    queryFn: () => getAllFormLinks(),
  },
  id: (id: string) => ({
    queryKey: ["id", id],
    queryFn: () => getFormLinkById({ data: { id } }),
  }),
  storefront: {
    queryKey: ["storefront"],
    queryFn: () => getStorefrontFormLink(),
  },
});
