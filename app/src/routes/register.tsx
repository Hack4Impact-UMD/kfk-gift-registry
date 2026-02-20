import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { createFamily } from "@/server/family";

export const Route = createFileRoute("/register")({
  component: RegisterRoute,
});

function RegisterRoute() {
  const [privateLink, setPrivateLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const parentName = String(formData.get("parentName") ?? "");
      const childName = String(formData.get("childName") ?? "");
      const email = String(formData.get("email") ?? "");
      const diagnosis = String(formData.get("diagnosis") ?? "");

      const result = await createFamily({
        data: {
          parentName,
          childName,
          email,
          diagnosis,
        },
      });

      setPrivateLink(`/family/${result.token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (privateLink) {
    return (
      <div>
        <h2>Your private link:</h2>
        <p>
          <a href={privateLink}>{privateLink}</a>
        </p>
        <p>Please save this link.</p>
      </div>
    );
  }

