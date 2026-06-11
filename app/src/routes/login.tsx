import { useState } from "react";
import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
  Link,
} from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { AuthErrorCodes } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { UserRole } from "common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/mutations/loginMutation";
import adminVolunteerLoginBg from "@/assets/admin-volunteer-login-bg.png";
import kfkFoundationLogo from "@/assets/kfk-logo.png";
import MfaDialog from "@/components/auth/MfaDialog";
import MfaMethodDialog from "@/components/auth/MfaMethodDialog";
import { useMfaFlow } from "@/hooks/useMfaFlow";
import { getEnrolledMFAMethods } from "@/services/authService.client";

const searchSchema = z.object({
  redirect: z
    .string()
    .optional()
    .refine((val) => !val || (val.startsWith("/") && !val.startsWith("//")), {
      message: "Invalid redirect path",
    }),
});

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Email must be a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const Route = createFileRoute("/login")({
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
  head: () => ({
    meta: [
      { title: "Login - Kisses for Kyle" },
      {
        name: "description",
        content: "Login to your Kisses for Kyle account",
      },
    ],
  }),
  component: RouteComponent,
});

function getLoginErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === AuthErrorCodes.MFA_REQUIRED) {
      return "MFA Required";
    }

    if (
      error.code === AuthErrorCodes.INVALID_LOGIN_CREDENTIALS ||
      error.code === AuthErrorCodes.INVALID_PASSWORD ||
      error.code === AuthErrorCodes.INVALID_EMAIL
    ) {
      return "Invalid email or password";
    }

    return "Login failed";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Login failed";
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
  const navigate = useNavigate();
  const router = useRouter();
  const { redirect: redirectPath } = Route.useSearch();

  const loginMutation = useLogin();
  const [rememberMe, setRememberMe] = useState(false);

  const { handleMfa, mfaMethodDialogProps, mfaDialogProps } = useMfaFlow(
    (result) => {
      navigate({
        to:
          redirectPath ??
          (result?.role === UserRole.DONOR ? "/donor" : "/staff/home"),
      });
    },
  );

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      loginMutation.mutate(
        {
          email: value.email,
          password: value.password,
          callback: handleMfa,
        },
        {
          onSuccess: async (result) => {
            if (result) {
              let methods = [];
              try {
                methods = await getEnrolledMFAMethods();
              } catch (err) {
                console.warn("Failed to fetch MFA methods:", err);
              }
              if (result.role !== UserRole.DONOR && methods.length === 0) {
                await navigate({ to: "/mfaEnroll" });
              } else {
                router.invalidate();
                await navigate({
                  to:
                    redirectPath ??
                    (result.role === UserRole.DONOR ? "/donor" : "/staff/home"),
                });
              }
            }
          },
        },
      );
    },
  });

  const isSubmitting = form.state.isSubmitting || loginMutation.isPending;

  return (
    <div className="h-full flex items-center justify-center bg-muted/30 p-4 sm:p-6">
      <MfaMethodDialog {...mfaMethodDialogProps} />
      <MfaDialog {...mfaDialogProps} />
      <div className="flex w-full max-w-5xl max-h-164 h-full flex-col items-stretch lg:flex-row">
        {/* Image section: hidden on small screens */}
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
              <div className="flex flex-col gap-0">
                <h1 className="text-lg font-semibold text-foreground text-center">
                  Welcome Back!
                </h1>
                {/* Logo from assets */}
                <div className="flex justify-center">
                  <img
                    src={kfkFoundationLogo}
                    alt="Kisses for Kyle Foundation"
                    className="w-full max-w-xs sm:max-w-sm h-auto object-contain "
                  />
                </div>
                <p className="mt-5 text-center text-base text-kfk-blue">
                  User Log-in
                </p>
              </div>

              <form.Field name="email">
                {(field) => (
                  <div className="flex flex-col gap-1">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="w-full h-10 rounded-lg border-input"
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-kfk-red">
                          {issueToMessage(field.state.meta.errors[0])}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              <form.Field name="password">
                {(field) => (
                  <div className="flex flex-col gap-1">
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="w-full h-10 rounded-lg border-input"
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-kfk-red">
                          {issueToMessage(field.state.meta.errors[0])}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-full border-input size-4 text-kfk-blue focus:ring-kfk-blue"
                  />
                  <span className="text-sm text-foreground">Remember me</span>
                </label>
                <Link
                  to="/forgotPassword"
                  className="text-sm underline hover:opacity-80 text-kfk-blue"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-full text-white disabled:opacity-50 flex items-center justify-center bg-kfk-blue hover:bg-kfk-blue/90"
              >
                {isSubmitting ? "Logging in…" : "Login"}
              </Button>

              <div className="min-h-5">
                {loginMutation.isError && (
                  <p className="text-sm text-kfk-red text-center">
                    {getLoginErrorMessage(loginMutation.error)}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
