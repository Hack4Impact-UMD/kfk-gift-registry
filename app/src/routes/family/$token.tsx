import { createFileRoute } from "@tanstack/react-router";
import { getFamilyByToken } from "@/server/family";

export const Route = createFileRoute("/family/$token")({
  loader: async ({ params }) => {
    return await getFamilyByToken({ data: { token: params.token } });
  },
  component: FamilyRoute,
  errorComponent: FamilyError,
});

function FamilyRoute() {
  // const family = Route.useLoaderData();

  return (
    <div>
      {/*

      <h1>Hi this is unique to {family.childName}</h1>
      <p>Data for {family.childName}</p>
      <p>Parent: {family.parentName}</p>
      <p>Email: {family.email}</p>
      <p>Diagnosis: {family.diagnosis}</p>
        */}
    </div>
  );
}

function FamilyError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Invalid link";

  return (
    <div>
      <h1>Unable to load family</h1>
      <p>{message}</p>
    </div>
  );
}
