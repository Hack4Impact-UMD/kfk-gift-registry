import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/family/form/$formLinkId/$")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/family/form/$formLinkId/consent",
      params: { formLinkId: params.formLinkId },
    });
  },
});
