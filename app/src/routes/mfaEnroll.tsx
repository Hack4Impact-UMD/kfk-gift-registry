import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { UserRole } from "common";
import { Button } from "@/components/ui/button";
import MFAEnrollDialog from "@/components/auth/MFAEnrollDialog";
import MfaDialog from "@/components/auth/MfaDialog";
import { useMfaEnrollFlow } from "@/hooks/useMfaFlow";
import kfkFoundationLogo from "@/assets/kfk-logo.png";

export const Route = createFileRoute("/mfaEnroll")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthed) {
      throw redirect({ to: "/login" });
    }
    if (context.auth.authUser.role === UserRole.DONOR) {
      throw redirect({ to: "/donor" });
    }
  },
  head: () => ({
    meta: [{ title: "Set Up 2FA - Kisses for Kyle" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { auth } = Route.useRouteContext();
  const phone = auth.isAuthed ? auth.authUser.phone : undefined;

  const {
    triggerEnroll,
    enrollDialogProps,
    mfaDialogProps: enrollCodeDialogProps,
  } = useMfaEnrollFlow(() => {
    navigate({ to: "/staff/home" });
  });

  return (
    <div className="h-full flex items-center justify-center bg-muted/30 p-4 sm:p-6">
      <MFAEnrollDialog {...enrollDialogProps} defaultPhone={phone} />
      <MfaDialog {...enrollCodeDialogProps} />
      <div className="bg-white rounded-2xl shadow-xl flex flex-col items-center gap-6 max-w-sm w-full overflow-hidden">
        <div
          className="w-full h-8 shrink-0 rounded-t-2xl bg-kfk-blue"
          aria-hidden
        />
        <div className="flex flex-col items-center gap-6 px-8 pb-10">
          <img
            src={kfkFoundationLogo}
            alt="Kisses for Kyle Foundation"
            className="w-full max-w-xs h-auto object-contain"
          />
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-lg font-semibold">
              Two-Factor Authentication Required
            </h1>
            <p className="text-sm text-muted-foreground">
              Staff accounts must be protected with SMS two-factor
              authentication. Please set it up to continue to your account.
            </p>
          </div>
          <Button
            onClick={triggerEnroll}
            className="w-full rounded-full bg-kfk-blue hover:bg-kfk-blue/90 text-white"
          >
            Set Up Two-Factor Authentication
          </Button>
        </div>
      </div>
    </div>
  );
}
