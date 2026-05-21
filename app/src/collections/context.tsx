import { useQueryClient } from "@tanstack/react-query";
import { createCollections } from "./factory";
import type { Collections } from "./factory";
import { createContext, useContext, useMemo } from "react";

const CollectionsContext = createContext<Collections | null>(null);

export function CollectionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const collections = useMemo(
    () => createCollections(queryClient),
    [queryClient],
  );
  return (
    <CollectionsContext.Provider value={collections}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections(): Collections {
  const ctx = useContext(CollectionsContext);
  if (!ctx) {
    throw new Error("useCollections must be used within a CollectionsProvider");
  }
  return ctx;
}
