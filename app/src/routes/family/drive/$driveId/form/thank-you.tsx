import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/family/drive/$driveId/form/thank-you")({
  component: ThankYouComponent,
});

function ThankYouComponent() {
  return (
    <div className="flex flex-col gap-10 items-center justify-center text-center py-8">
      <h2 className="text-2xl font-bold text-[var(--color-kfk-blue)]">
        Thank you for submitting!
      </h2>
      <p className="text-gray-600 max-w-md">
        Your family&apos;s gift drive information has been received and will be
        reviewed shortly.
      </p>
    </div>
  );
}
