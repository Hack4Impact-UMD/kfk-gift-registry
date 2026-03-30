import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import z from "zod";

const ThankYouSchema = z.object({
  linkId: z.string(),
});

export const Route = createFileRoute("/family/drive/$driveId/form/thank-you")({
  validateSearch: ThankYouSchema,
  component: ThankYouComponent,
});

function ThankYouComponent() {
  const { linkId } = Route.useSearch();
  return (
    <div className="flex flex-col gap-10 items-center justify-center text-center py-8">
      <h2 className="text-2xl font-bold text-[var(--color-kfk-blue)]">
        Thank you for submitting!
      </h2>
      <p className="text-gray-600 max-w-md">
        Your family&apos;s gift drive information has been received and will be
        reviewed shortly.
      </p>
      <Button asChild>
        <Link to={"/family/$token"} params={{ token: linkId }}>
          Go To Family Page
        </Link>
      </Button>
    </div>
  );
}
