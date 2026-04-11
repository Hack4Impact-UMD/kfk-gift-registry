import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useAllGiftDrives() {
  return useQuery(queries.drives.all);
}
