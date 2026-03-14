import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import KFKLogo from "@/assets/kfk-logo.png";
import Ladybug from "@/assets/ladybug-signup.png";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/signup/admin/$inviteId")({
  loader: async ({ params }) => {
    return {
      id: params.inviteId,
      sentBy: "admin123",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      role: "ADMIN",
      createdAt: new Date().toISOString(),
      used: false,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const invite = Route.useLoaderData();

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-muted/30 p-6 overflow-hidden">

      <img
        src={Ladybug}
        alt=""
        className="absolute left-1/2 -translate-x-1/2 w-full pointer-events-none select-none z-0"
      />

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col z-10">

        <div className="h-8 bg-kfk-blue" />

        <div className="flex justify-center pt-6">
          <img
            src={KFKLogo}
            alt="Kisses for Kyle Foundation"
            className="max-w-xs w-full object-contain"
          />
        </div>

        <div className="flex flex-col px-10 py-10 gap-6">

          <h1 className="text-3xl font-bold text-center">
            Create Your Account
          </h1>

          <form className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();

              // Call registration mutation here
              console.log("Form is valid! Submit data...");
            }}
          >

            <div>
              <label className="font-semibold">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Jane Doe"
                defaultValue={invite.firstName + " " + invite.lastName}
                className="w-full border border-muted-foreground rounded-md px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="font-semibold">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. (555)-555-5555"
                className="w-full border border-muted-foreground rounded-md px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="font-semibold">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                value={invite.email}
                disabled
                className="w-full border border-muted-foreground rounded-md px-3 py-2 mt-1 bg-gray-100 text-muted-foreground"
              />
            </div>

            <div>
              <label className="font-semibold">
                Password <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="e.g. ••••••••••••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-muted-foreground rounded-md px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="font-semibold">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="e.g. ••••••••••••••••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-muted-foreground rounded-md px-3 py-2 mt-1"
              />
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                className="mt-4 bg-kfk-blue w-1/2 text-white font-semibold py-3 rounded-full hover:opacity-90 transition"
              >
                Create Account
              </Button>
            </div> 

          </form>
        </div>

      </div>
    </div>
  );
}
