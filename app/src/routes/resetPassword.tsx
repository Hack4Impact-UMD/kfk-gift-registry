import { useState } from "react";
import {
  createFileRoute,
  redirect,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { FirebaseError } from "firebase/app";
import { UserRole } from "common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { confirmPasswordReset } from "@/services/authService.client";
import adminVolunteerLoginBg from "@/assets/admin-volunteer-login-bg.png";
import kfkFoundationLogo from "@/assets/kfk-logo.png";

const searchSchema = z.object({
  oobCode: z
    .string()
    .min(1, "Reset code is required"),
  continueUrl: z
    .string()
    .optional(),
});

const resetPasswordSchema = z.object({ // standard password reset schema
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const Route = createFileRoute("/resetPassword")({
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

function getResetPasswordErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === "auth/expired-action-code") {
      return "Reset link has expired. Please request a new password reset.";
    }

    if (error.code === "auth/invalid-action-code") {
      return "Invalid reset link. Please request a new password reset.";
    }

    if (error.code === "auth/weak-password") {
      return "Password is too weak. Please use a stronger password.";
    }

    return "Failed to reset password";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to reset password";
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

interface PasswordRequirement {
  label: string;
  regex: RegExp;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", regex: /.{8,}/ },
  { label: "At least one uppercase letter", regex: /[A-Z]/ },
  { label: "At least one lowercase letter", regex: /[a-z]/ },
  { label: "At least one number", regex: /[0-9]/ },
  { label: "At least one special character", regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ },
];

function RouteComponent() {
  const { oobCode } = Route.useSearch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState("");

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setError(null);
        setIsSubmitting(true);

        await confirmPasswordReset(oobCode, value.password);
        navigate({ to: "/resetSuccess" });
      } catch (err) {
        setError(getResetPasswordErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const metPassword = passwordRequirements.map((req) => ({
    ...req,
    isMet: req.regex.test(passwordValue),
  }));

  const allRequirementsMet = metPassword.every((req) => req.isMet);

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
                  Reset Password
                </h1>
                <p className="text-sm text-muted-foreground">
                  Create a strong password to secure your account.
                </p>
              </div>

              <form.Field name="password">
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={field.state.value}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          setPasswordValue(e.target.value);
                        }}
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

              <form.Field name="confirmPassword">
                {(field) => (
                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="Confirm password"
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

              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-foreground mb-3">
                  Password requirements:
                </p>
                <ul className="space-y-2">
                  {metPassword.map((req, idx) => (
                    <li
                      key={idx}
                      className={`text-xs flex items-center gap-2 transition-colors ${
                        req.isMet
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span className="text-lg leading-none">
                        {req.isMet ? "✔️" : "✕"}
                      </span>
                      {req.label}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !allRequirementsMet}
                className="w-full h-11 rounded-full text-white disabled:opacity-50 flex items-center justify-center bg-kfk-blue hover:bg-kfk-blue/90"
              >
                {isSubmitting ? "Resetting…" : "Reset Password"}
              </Button>

              <Link
                to="/login"
                className="text-center text-sm text-kfk-blue hover:opacity-80 underline"
              >
                Return to Login
              </Link>

              <div className="min-h-5">
                {error && (
                  <p className="text-sm text-kfk-red text-center">
                    {error}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 text-xs">
        <Link
          to="/forgotPassword"
          className="text-muted-foreground hover:text-foreground underline"
        >
          [Dev] Forgot Password
        </Link>
      </div>
    </div>
  );
}
