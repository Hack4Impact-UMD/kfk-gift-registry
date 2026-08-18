import { useQuery } from "@tanstack/react-query";
import { ref, getDownloadURL } from "firebase/storage";
import { getClientStorage } from "@/lib/firebase";

export const storageUrlKey = (path: string | null) =>
  ["storageUrl", path] as const;

export function useStorageUrl(path: string | null): string | null {
  const { data = null } = useQuery({
    queryKey: storageUrlKey(path),
    queryFn: async () => {
      if (!path) return null;
      // Backward compat: old records stored the full download URL directly
      if (path.startsWith("https://")) return path;
      const storage = await getClientStorage();
      return getDownloadURL(ref(storage, path));
    },
    enabled: path !== null,
    staleTime: Infinity,
  });
  return data;
}
