import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";

export function useUserProfile(uid: string) {
  return useQuery({
    ...queries.users.id(uid),
    queryFn: async () => {
      // TODO: Call getUserProfileById here
      throw new Error("Not Implemented");
    },
  });
}
