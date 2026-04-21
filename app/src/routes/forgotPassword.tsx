import { useState } from "react";
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { FirebaseError } from "firebase/app";
import { UserRole } from "common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendPasswordResetEmail } from "@/services/authService.client";
import adminVolunteerLoginBg from "@/assets/admin-volunteer-login-bg.png";
import kfkFoundationLogo from "@/assets/kfk-logo.png";
import ladybugSuccess from "@/assets/ladybug-success.png";

const searchSchema = z.object({
  redirect: z
    .string()
    .optional()
    .refine((val) => !val || (val.startsWith("/") && !val.startsWith("//")), {
      message: "Invalid redirect path",
    }),
});

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Email must be a valid email"),
});

export const Route = createFileRoute("/forgotPassword")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthed) {
      throw redirect({
        to:
          context.auth.authUser.role === UserRole.DONOR
            ? "/donor"
            : "/staff/home",
      });
    }
  },
  validateSearch: searchSchema,
  component: RouteComponent,
});

function getForgotPasswordErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return "Failed to send reset email";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to send reset email";
}

function issueToMessage(issue: unknown): string {
  if (!issue) return "Invalid value";
  if (typeof issue === "string") return issue;
  if (
    typeof issue === "object" &&
    "message" in issue &&
    typeof (issue as { message: unknown }).message === "string"
  ) {
    return (issue as { message: string }).message;
  }
  return "Invalid value";
}

function RouteComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: async () => {
      try {
        setError(null);
        setIsSubmitting(true);

        await sendPasswordResetEmail(form.state.values.email);

        setIsEmailSent(true);
      } catch (err) {
        if (
          err instanceof FirebaseError &&
          (err.code === "auth/user-not-found" ||
            err.code === "auth/invalid-credential")
        ) {
          setIsEmailSent(true);
        } else {
          setError(getForgotPasswordErrorMessage(err));
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="h-full flex items-center justify-center bg-muted/30 p-4 sm:p-6">
      <div className="flex w-full max-w-5xl max-h-164 h-full flex-col items-stretch lg:flex-row">
        <div
          className="hidden lg:block lg:flex-1 lg:rounded-2xl bg-cover bg-center bg-kfk-blue/10"
          style={{
            backgroundImage: `url(${adminVolunteerLoginBg})`,
          }}
          role="img"
          aria-label="Decorative background"
        />

        <div className="w-full lg:flex-1 rounded-2xl overflow-hidden bg-white shadow-xl flex flex-col lg:-ml-8 z-10 pb-8 sm:pb-10">
          <div
            className="w-full h-8 shrink-0 rounded-t-2xl bg-kfk-blue"
            aria-hidden
          />
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-14">
            {!isEmailSent ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="w-full max-w-sm lg:max-w-xs flex flex-col gap-5"
              >
                <div className="flex justify-center -mt-8 mb-4">
                  <img
                    src={kfkFoundationLogo}
                    alt="Kisses for Kyle Foundation"
                    className="w-full max-w-xs sm:max-w-sm h-auto object-contain"
                  />
                </div>

                <div className="flex flex-col gap-4 items-center text-center">
                  <h1 className="text-lg font-semibold text-foreground">
                    Forgot Password?
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    No worries! We will send you reset instructions.
                  </p>
                </div>

                <form.Field name="email">
                  {(field) => (
                    <div className="flex flex-col gap-1">
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="e.g. christy@gmail.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="w-full h-10 rounded-lg border-input"
                        />
                      </div>
                      {field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-kfk-red">
                            {issueToMessage(field.state.meta.errors[0])}
                          </p>
                        )}
                    </div>
                  )}
                </form.Field>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-full text-white disabled:opacity-50 flex items-center justify-center bg-kfk-blue hover:bg-kfk-blue/90"
                >
                  {isSubmitting ? "Sending…" : "Submit"}
                </Button>

                <Link
                  to="/login"
                  className="text-center text-sm text-kfk-blue hover:opacity-80 underline"
                >
                  Return to Login
                </Link>

                <div className="min-h-5">
                  {error && (
                    <p className="text-sm text-kfk-red text-center">{error}</p>
                  )}
                </div>
              </form>
            ) : (
              <div className="w-full h-full flex flex-col gap-5 items-center text-center justify-between">
                <div className="flex justify-center -mt-8">
                  <img
                    src={kfkFoundationLogo}
                    alt="Kisses for Kyle Foundation"
                    className="w-full max-w-xs sm:max-w-sm h-auto object-contain"
                  />
                </div>

                <div className="flex flex-col gap-4 flex-1 justify-center items-center max-w-sm lg:max-w-xs">
                  <h1 className="text-2xl font-semibold text-foreground">
                    Email Sent!
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Please click on the link in your email to reset your
                    password.
                  </p>
                </div>

                <div className="w-full flex-1 flex flex-col items-center justify-start">
                  <Link
                    to="/login"
                    className="text-center text-sm text-kfk-blue hover:opacity-80 underline mb-4"
                  >
                    Return to Login
                  </Link>

                  <div className="flex justify-center w-full flex-1 -mx-6 sm:-mx-14">
                    <img
                      src={ladybugSuccess}
                      alt="Success ladybug"
                      className="w-screen h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
