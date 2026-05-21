import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createCollections, type Collections } from "./factory";

const CollectionsContext = React.createContext<Collections | null>(null);

export function CollectionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const collections = React.useMemo(
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
  const ctx = React.useContext(CollectionsContext);
  if (!ctx) {
    throw new Error(
      "useCollections must be used within a CollectionsProvider",
    );
  }
  return ctx;
}
