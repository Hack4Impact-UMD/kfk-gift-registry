import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useStorefrontUniqueDonors(driveId?: string) {
  return useQuery({
    ...queries.storefront.uniqueDonorsForDrive(driveId ?? ""),
    enabled: !!driveId,
  });
}
