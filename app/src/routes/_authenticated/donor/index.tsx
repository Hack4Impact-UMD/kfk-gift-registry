import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/donor/")({
  beforeLoad: () => {
    throw redirect({
      to: "/donor/home",
    });
  },
});
