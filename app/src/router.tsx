import * as Sentry from "@sentry/tanstackstart-react";
import { createRouter } from "@tanstack/react-router";
import { DbClient, DbProvider } from "@tanstack/react-db";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";
import { CollectionsProvider } from "./collections/context";
import { NotFoundScreen } from "@/components/NotFoundScreen";
import {
  SENTRY_DSN,
  SENTRY_ENVIRONMENT,
  SENTRY_TRACES_SAMPLE_RATE,
} from "@/lib/sentry";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext();
  const dbClient = new DbClient();

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
    // Errors caught by route error boundaries are otherwise never reported.
    defaultOnCatch: (error, errorInfo) => {
      Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } },
      });
    },
    notFoundMode: "root",

    defaultPreload: "intent",

    // setupRouterSsrQueryIntegration below composes its QueryClientProvider
    // around whatever Wrap we install here, so CollectionsProvider ends up
    // *inside* QueryClientProvider and can read the per-request queryClient.
    Wrap: ({ children }) => (
      <DbProvider client={dbClient}>
        <CollectionsProvider>{children}</CollectionsProvider>
      </DbProvider>
    ),
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient: rqContext.queryClient,
  });

  if (!router.isServer) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: SENTRY_ENVIRONMENT,
      integrations: [
        Sentry.tanstackRouterBrowserTracingIntegration(router),
        Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
      ],
      tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
    });
  }

  return router;
};
