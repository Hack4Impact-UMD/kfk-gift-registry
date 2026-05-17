import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/family/$token/")({
  head: () => ({
    meta: [
      { title: "Family Dashboard - Kisses for Kyle" },
      {
        name: "description",
        content: "Manage your family's gift drive participation",
      },
    ],
  }),
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/family/$token/home",
      params: { token: params.token },
    });
  },
});
