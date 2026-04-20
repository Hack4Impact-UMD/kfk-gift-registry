import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";
import z from "zod";
import { UserRole } from "common";

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

function RouteComponent() {
  return (
    <div className="h-full flex items-center justify-center bg-muted/30 p-4 sm:p-6">
      <div className="flex w-full max-w-5xl max-h-164 h-full flex-col items-stretch lg:flex-row">
        <div
          className="hidden lg:block lg:flex-1 lg:rounded-2xl bg-cover bg-center bg-kfk-blue/10"
          style={{
            backgroundImage: `url()`,
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
            {/* TODO: Add reset password form UI */}
            <div className="text-center">
              <p className="text-muted-foreground">Reset password form coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
