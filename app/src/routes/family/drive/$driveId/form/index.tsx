import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/family/drive/$driveId/form/")({
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
      to: "/family/drive/$driveId/form/consent",
      params: { driveId: params.driveId },
    });
  },
});
