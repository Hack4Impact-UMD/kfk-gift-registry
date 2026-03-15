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

type InviteFieldProps = {
  type?: string,
  field: any,
  placeholder: string,
  disabled?: boolean,
};

function InviteFieldInput({
  type,
  field,
  placeholder,
  disabled
}: InviteFieldProps) {
  const errorMessage = field.state.meta.isTouched && field.state.meta.errors?.[0];
  
  return (
    <>
      <Input
        type={type}
        name={field.name}
        id={field.id}
        value={field.state.value}
        placeholder={placeholder}
        className={`w-full border border-muted-foreground rounded-md px-3 py-2 mt-1 
          ${errorMessage ? "border-red-500 bg-[#FFF0F0] placeholder:text-red-500 text-red-500" : ""}`}
        onChange={(e) => field.handleChange(e.target.value)}
        disabled={disabled}
      />
      {errorMessage && (
        <span className="text-xs text-red-500 mt-1 -mb-2 block pl-1">{errorMessage}</span>
      )}
    </>
  )
} 

function RouteComponent() {
  const invite = Route.useLoaderData();

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const form = useForm({
    defaultValues: {
      fullName: invite.firstName + " " + invite.lastName,
      phoneNumber: "",
      email: invite.email,
      password: "",
      confirmPassword: "",
    },
    onSubmit: ({value}) => {
      console.log("Subbmited Data: ", value);
    }
  })

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
              <form.Field
                name="fullName"
                validators={{
                  onChange: ({ value }) => 
                    !value ? "This field is required" : value.length > 100 ? "Name is too long" : undefined
                }}
                children={(field) => (
                  <InviteFieldInput
                    field={field}
                    placeholder="e.g. Jane Doe"
                  />
                )}
              />
            </div>

            <div>
              <label className="font-semibold">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <form.Field
                name="phoneNumber"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || value  === "") return "This field is required";
                    if (!/^\(\d{3}\)-\d{3}-\d{4}$/.test(value))
                      return "Format must be (555)-555-5555";
                    return undefined;
                  }  
                }}
                children={(field) => (
                  <InviteFieldInput
                    field={field}
                    placeholder="e.g. (555)-555-5555"
                  />
                )}
              />
            </div>

            <div>
              <label className="font-semibold">
                Email <span className="text-red-500">*</span>
              </label>
              <form.Field
                name="email"
                children={(field) => (
                  <Input
                    value={invite.email}
                    disabled
                    className="w-full border border-muted-foreground rounded-md px-3 py-2 mt-1 bg-gray-100 text-muted-foreground"
                  />
                )}
                
              />
            </div>

            <div>
              <label className="font-semibold">
                Password <span className="text-red-500">*</span>
              </label>
              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || value  === "") return "This field is required";
                    if (value.length < 8) return "Must be at least 8 characters";
                    if (!/[A-Z]/.test(value)) return "Missing an uppercase letter";
                    if (!/[a-z]/.test(value)) return "Missing a lowercase letter";
                    if (!/\d/.test(value)) return "Missing a number";
                    if (!/[@$!%*?&]/.test(value)) return "Missing a special character";
                    return undefined;
                  }  
                }}
                children={(field) => (
                  <InviteFieldInput
                    type="password"
                    field={field}
                    placeholder="e.g. ••••••••••••••••••••••••••"
                  />
                )}
              />
            </div>

            <div>
              <label className="font-semibold">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <form.Field
                name="confirmPassword"
                validators={{
                  onChange: ({ value, fieldApi }) => {
                    if (value !== fieldApi.form.getFieldValue("password"))
                      return "Password does not match"
                    return undefined;
                  }  
                }}
                children={(field) => (
                  <InviteFieldInput
                    type="password"
                    field={field}
                    placeholder="e.g. ••••••••••••••••••••••••••"
                  />
                )}
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
