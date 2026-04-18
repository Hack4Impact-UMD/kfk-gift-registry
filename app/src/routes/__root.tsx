import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import type { AuthContext } from "@/server/functions/auth";
import { getActiveGiftDrive } from "@/server/functions/giftDrive";
import { queries } from "@/queries";

interface MyRouterContext {
  queryClient: QueryClient;
  auth: AuthContext;
}

const sessionQuery = queryOptions({
  ...queries.session.verify,
  staleTime: 1000 * 60 * 60,
  gcTime: 1000 * 60 * 60 * 24,
});

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Kisses for Kyle Gift Drive",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  beforeLoad: async ({ context }) => {
    const authUser = await context.queryClient.fetchQuery(sessionQuery);
    const currentDrive = await getActiveGiftDrive().catch(() => undefined);

    if (authUser) {
      return {
        auth: {
          isAuthed: true as const,
          authUser,
        },
        currentDrive,
      };
    } else {
      return {
        auth: {
          isAuthed: false as const,
          authUser: null,
        },
        currentDrive,
      };
    }
  },
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRouterState();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {isLoading && (
          <>
            <div
              className="fixed top-0 left-0 right-0 z-9999 h-0.75"
              style={{
                background:
                  "linear-gradient(90deg, #0839b1 20%, #cedcff 50%, #0839b1 80%)",
                backgroundSize: "200% 100%",
                animation: "loading-shimmer 1.2s ease-in-out infinite",
              }}
            />
            <div className="fixed inset-0 z-9998" />
          </>
        )}
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
