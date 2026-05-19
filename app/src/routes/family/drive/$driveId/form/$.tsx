import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/family/drive/$driveId/form/$")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/family/drive/$driveId/form/consent",
      params: { driveId: params.driveId },
    });
  },
});
