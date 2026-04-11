import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useGiftDrive(id: string) {
  return useQuery({
    ...queries.drives.id(id),
    enabled: id.length > 0,
  });
}
