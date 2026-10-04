import { logger } from "@sentry/tanstackstart-react";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";

// Only the static "namespace.method" segments — later segments can hold
// secrets such as family link tokens.
function describeKey(key: QueryKey | undefined) {
  if (!key) return "unknown";
  return key
    .slice(0, 2)
    .filter(
      (part): part is string =>
        typeof part === "string" && /^[A-Za-z]+$/.test(part),
    )
    .join(".");
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function getContext() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        logger.error("Query failed", {
          query: describeKey(query.queryKey),
          error: errorMessage(error),
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        logger.error("Mutation failed", {
          mutation: describeKey(mutation.options.mutationKey),
          error: errorMessage(error),
        });
      },
    }),
  });
  return {
    queryClient,
  };
}
