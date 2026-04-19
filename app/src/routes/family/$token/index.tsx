import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/family/$token/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/family/$token/home",
      params: { token: params.token },
    });
  },
});
