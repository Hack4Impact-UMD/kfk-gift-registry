import { createFileRoute, Link } from "@tanstack/react-router";
import KFKLogo from "@/assets/kfk-logo.png";
import Ladybug from "@/assets/ladybug-success.png";

export const Route = createFileRoute("/signup/success")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">

        <div className="h-8 bg-kfk-blue" />

        <div className="flex justify-center py-6">
          <img
            src={KFKLogo}
            alt="Kisses for Kyle Foundation"
            className="max-w-xs w-full object-contain"
          />
        </div>

        <div className="flex flex-col items-center text-center px-8 pt-10 gap-4">
          <h1 className="text-3xl font-bold text-foreground">
            Thank you for registering!
          </h1>

          <Link
            to="/login"
            className="text-kfk-blue font-bold underline hover:no-underline"
          >
            TO SIGN IN
          </Link>
        </div>

        <div className="flex justify-center">
          <img
            src={Ladybug}
            alt=""
            className="w-full h-auto object-contain"
          />
        </div>

      </div>
    </div>
  );
}
