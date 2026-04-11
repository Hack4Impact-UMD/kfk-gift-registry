import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  getAllUserProfiles,
  getCurrentUserProfile,
  getUserProfileById,
} from "@/server/functions/profile";

export const userProfileQueries = createQueryKeys("users", {
  all: {
    queryKey: ["all"],
    queryFn: () => getAllUserProfiles(),
  },
  me: {
    queryKey: ["me"],
    queryFn: () => getCurrentUserProfile(),
  },
  id: (uid: string) => ({
    queryKey: ["id", uid],
    queryFn: () => getUserProfileById({ data: { uid } }),
  }),
});
