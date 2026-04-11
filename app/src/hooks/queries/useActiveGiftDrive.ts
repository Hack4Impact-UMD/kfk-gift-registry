import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useActiveGiftDrive() {
  return useQuery(queries.drives.active);
}
