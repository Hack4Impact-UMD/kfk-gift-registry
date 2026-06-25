import { useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "@tanstack/react-form";
import { sendFamilyRecoveryLink } from "@/server/functions/family";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const RECOVERY_CONFIRMATION_MESSAGE =
  "If an account is associated with that email address, we've sent a family page recovery link. Please check your inbox and spam folder.";

interface StorefrontFamilyRecoveryDialogProps {
  children: ReactNode;
}

function getRecoveryErrorMessage(_error: unknown) {
  return "We couldn't process that request right now. Please try again.";
}

export function StorefrontFamilyRecoveryDialog({
  children,
}: StorefrontFamilyRecoveryDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError(null);
        setIsSubmitting(true);

        await sendFamilyRecoveryLink({
          data: { email: value.email.trim().toLowerCase() },
        });

        setSubmitted(true);
      } catch (error) {
        setSubmitError(getRecoveryErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset();
      setSubmitError(null);
      setSubmitted(false);
      setIsSubmitting(false);
    }

    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle>Recover family page link</DialogTitle>
              <DialogDescription>
                Enter the email address used on your family form and we&apos;ll
                send the link for your family page if we find a match.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    const normalizedValue = value.trim();

                    if (!normalizedValue) {
                      return "Email is required";
                    }

                    if (!EMAIL_RE.test(normalizedValue)) {
                      return "Enter a valid email address";
                    }

                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      id={field.name}
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    <FieldError
                      errors={field.state.meta.errors.map((error) => ({
                        message: String(error),
                      }))}
                    />
                  </div>
                )}
              </form.Field>

              {submitError ? (
                <p className="text-sm text-kfk-red">{submitError}</p>
              ) : null}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <form.Subscribe selector={(state) => [state.canSubmit]}>
                  {([canSubmit]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="bg-kfk-blue hover:bg-kfk-blue/90"
                    >
                      {isSubmitting ? "Sending..." : "Send recovery link"}
                    </Button>
                  )}
                </form.Subscribe>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Check your email</DialogTitle>
              <DialogDescription>
                {RECOVERY_CONFIRMATION_MESSAGE}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                type="button"
                className="bg-kfk-blue hover:bg-kfk-blue/90"
                onClick={() => handleOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
