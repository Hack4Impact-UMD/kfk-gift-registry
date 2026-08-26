import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";
import { CollectionsProvider } from "./collections/context";
import { NotFoundScreen } from "@/components/NotFoundScreen";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext();

  const router = createRouter({
    routeTree,
    context: {
      ...rqContext,
      auth: {
        authUser: null,
        isAuthed: false,
      },
    },
    defaultNotFoundComponent: () => <NotFoundScreen />,

    defaultPreload: "intent",

    // setupRouterSsrQueryIntegration below composes its QueryClientProvider
    // around whatever Wrap we install here, so CollectionsProvider ends up
    // *inside* QueryClientProvider and can read the per-request queryClient.
    Wrap: ({ children }) => (
      <CollectionsProvider>{children}</CollectionsProvider>
    ),
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient: rqContext.queryClient,
  });

  return router;
};
