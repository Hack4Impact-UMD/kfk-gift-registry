import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CollectionsProvider } from "@/collections/context";

export function getContext() {
  const queryClient = new QueryClient();
  return {
    queryClient,
  };
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <CollectionsProvider>{children}</CollectionsProvider>
    </QueryClientProvider>
  );
}
