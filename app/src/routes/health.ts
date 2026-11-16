import { createFileRoute } from "@tanstack/react-router";

// Liveness endpoint for uptime monitors. Touches no data so frequent checks
// don't cost Firestore reads (the storefront at / reads thousands of docs).
export const Route = createFileRoute("/health")({
  server: {
    handlers: {
      GET: () =>
        new Response("ok", {
          headers: { "Cache-Control": "no-store" },
        }),
    },
  },
});
