import {
  createFileRoute,
  redirect,
  Link,
} from "@tanstack/react-router";
import { UserRole } from "common";
import kfkFoundationLogo from "@/assets/kfk-logo.png";
import ladybugSuccess from "@/assets/ladybug-success.png";
import adminVolunteerLoginBg from "@/assets/admin-volunteer-login-bg.png";

export const Route = createFileRoute("/resetSuccess")({
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
  component: RouteComponent,
});

function RouteComponent() {
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
                  Password Reset Successful!
                </h1>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Your have successfully reset your password. 
                  Please use your new password when logging in.
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
