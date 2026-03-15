import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/family/drive/$driveId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
