import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/family/form/$formLinkId/")({
  head: () => ({
    meta: [
      { title: "Registration Form - Kisses for Kyle" },
      {
        name: "description",
        content: "Complete your family registration form",
      },
    ],
  }),
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/family/form/$formLinkId/consent",
      params: { formLinkId: params.formLinkId },
    });
  },
});
