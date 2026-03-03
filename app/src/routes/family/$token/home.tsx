import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/family/$token/home")({
  component: FamilyHome,
});

function FamilyHome() {
  return <div>Notifications will go here</div>;
}