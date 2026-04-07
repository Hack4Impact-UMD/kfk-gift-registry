import * as React from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import z from "zod";
import { useForm, useStore } from "@tanstack/react-form";
import type { AnyFieldApi } from "@tanstack/react-form";
import KFKLogo from "@/assets/kfk-logo.png";
import Ladybug from "@/assets/ladybug-signup.png";
import { Input } from "@/components/ui/input";
import {
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  InboxIcon,
  KeyIcon,
  PhoneIcon,
  UserCircleIcon,
  XCircleIcon,
} from "@/components/icons";

import { Button } from "@/components/ui/button";
import { PhoneInput, formatToE164 } from "@/components/ui/phone-input";
import { getStaffInviteById } from "@/server/functions/invite";
import { useRegisterStaffWithInvite } from "@/hooks/mutations/useRegisterStaff";

export const Route = createFileRoute("/signup/admin/$inviteId")({
  loader: async ({ params }) => {
    try {
      const invite = await getStaffInviteById({
        data: { inviteId: params.inviteId },
      });

      return invite;
    } catch (err) {
      console.error(err);
      throw redirect({
        to: "/login",
      });
    }
  },
  component: RouteComponent,
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "This field is required")
      .max(100, "Name is too long"),
    phoneNumber: z
      .string()
      .min(1, "This field is required")
      .regex(/^\(\d{3}\)-\d{3}-\d{4}$/, "Format must be (555)-555-5555"),
    email: z.email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/\d/, "Must contain a number")
      .regex(/[@$!%*?&#^()]/, "Must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

type InviteFieldProps = {
  type?: string;
  field: AnyFieldApi;
  placeholder: string;
  disabled?: boolean;
  startIcon: React.ReactNode;
  inputComponent?: React.ComponentType<React.ComponentProps<typeof Input>>;
};

function InviteFieldInput({
  type,
  field,
  placeholder,
  disabled,
  startIcon,
  inputComponent: InputComponent = Input,
}: InviteFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const rawError = field.state.meta.isTouched && field.state.meta.errors?.[0];

  const errorMessage =
    typeof rawError === "string" ? rawError : rawError?.message;

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  return (
    <>
      <div className="relative w-full">
        <div
          className={`absolute left-2 top-1/2 -translate-y-1/2 mt-0.5 ${errorMessage ? "text-red-500" : "text-foreground"}`}
        >
          {startIcon}
        </div>

        <InputComponent
          type={inputType}
          name={field.name}
          value={field.state.value}
          placeholder={placeholder}
          className={`w-full border border-muted-foreground rounded-md px-3 pl-8 py-2 mt-1
            ${errorMessage ? "border-red-500 bg-[#FFF0F0] placeholder:text-red-500 text-red-500" : ""}`}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          disabled={disabled}
        />

        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            {showPassword ? (
              <EyeSlashIcon className="size-5" />
            ) : (
              <EyeIcon className="size-5 fill-current" />
            )}
          </Button>
        )}
      </div>
      {errorMessage && (
        <span className="text-xs text-red-500 mt-1 -mb-2 block pl-1">
          {errorMessage}
        </span>
      )}
    </>
  );
}

function RouteComponent() {
  const invite = Route.useLoaderData();

  const navigate = useNavigate();

  const registerMutation = useRegisterStaffWithInvite();

  const [passwordCriterias, setPasswordCriterias] = React.useState<
    Array<boolean>
  >([false, false, false, false, false]);

  const form = useForm({
    defaultValues: {
      fullName: invite.name,
      phoneNumber: "",
      email: invite.email,
      password: "",
      confirmPassword: "",
    },
    onSubmit: ({ value }) => {
      registerMutation.mutate(
        {
          data: {
            inviteId: invite.id,
            name: value.fullName.trim(),
            phone: formatToE164(value.phoneNumber),
            password: value.password,
          },
        },
        {
          onSuccess: () => {
            navigate({ to: "/signup/success" });
          },
          onError: (err: unknown) => {
            console.error(err);
          },
        },
      );
    },
    validators: {
      onChange: registerSchema,
    },
  });

  const isPasswordPristine = useStore(
    form.store,
    (state) => state.fieldMeta["password"]?.isPristine ?? true,
  );

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

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Call registration mutation here
              console.log("Form is valid! Submit data...");
              form.handleSubmit();
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
                    !value
                      ? "This field is required"
                      : value.length > 100
                        ? "Name is too long"
                        : undefined,
                }}
                children={(field) => (
                  <InviteFieldInput
                    field={field}
                    placeholder="e.g. Jane Doe"
                    startIcon={
                      <UserCircleIcon className="size-5 fill-current" />
                    }
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
                    if (!value || value === "") return "This field is required";
                    if (!/^\(\d{3}\)-\d{3}-\d{4}$/.test(value))
                      return "Format must be (555)-555-5555";
                    return undefined;
                  },
                }}
                children={(field) => (
                  <InviteFieldInput
                    field={field}
                    placeholder="e.g. (555)-555-5555"
                    startIcon={<PhoneIcon className="size-5 fill-current" />}
                    inputComponent={PhoneInput}
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
                children={() => (
                  <div className="relative w-full">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 mt-0.5 text-foreground">
                      <InboxIcon className="size-5 fill-current" />
                    </div>

                    <Input
                      value={invite.email}
                      className="w-full border border-muted-foreground rounded-md px-3 pl-8 py-2 mt-1 bg-gray-100 text-muted-foreground"
                      disabled
                    />
                  </div>
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
                    const newCriterias: Array<boolean> = [
                      false,
                      false,
                      false,
                      false,
                      false,
                    ];
                    if (!value || value === "") {
                      setPasswordCriterias(newCriterias);
                      return "This field is required";
                    }

                    if (value.length < 8) newCriterias[0] = false;
                    else newCriterias[0] = true;

                    if (!/[A-Z]/.test(value)) newCriterias[1] = false;
                    else newCriterias[1] = true;

                    if (!/[a-z]/.test(value)) newCriterias[2] = false;
                    else newCriterias[2] = true;

                    if (!/\d/.test(value)) newCriterias[3] = false;
                    else newCriterias[3] = true;

                    if (!/[@$!%*?&#^()]/.test(value)) newCriterias[4] = false;
                    else newCriterias[4] = true;

                    setPasswordCriterias(newCriterias);

                    return newCriterias.every((val) => val === true)
                      ? undefined
                      : "Password does not meet the requirements";
                  },
                }}
                children={(field) => (
                  <InviteFieldInput
                    type="password"
                    field={field}
                    placeholder=""
                    startIcon={<KeyIcon className="size-5" />}
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
                      return "Password does not match";
                    return undefined;
                  },
                }}
                children={(field) => (
                  <InviteFieldInput
                    type="password"
                    field={field}
                    placeholder=""
                    startIcon={<KeyIcon className="size-5" />}
                  />
                )}
              />
            </div>

            <div>
              <ul
                className={`flex flex-col gap-3 text-sm ml-4 mt-2 ${isPasswordPristine ? "[&_li]:text-gray-800!" : ""}`}
              >
                <li
                  className={`flex gap-1 ${!passwordCriterias[0] ? "text-kfk-red" : ""}`}
                >
                  {passwordCriterias[0] ? (
                    <CheckCircleIcon className="size-5 m-0 text-kfk-green" />
                  ) : (
                    <XCircleIcon className="size-5 m-0" />
                  )}
                  Password contains at least 8 characters
                </li>
                <li
                  className={`flex gap-1 ${!passwordCriterias[1] ? "text-kfk-red" : ""}`}
                >
                  {passwordCriterias[1] ? (
                    <CheckCircleIcon className="size-5 m-0 text-kfk-green" />
                  ) : (
                    <XCircleIcon className="size-5 m-0" />
                  )}
                  Password contains at least 1 uppercase character
                </li>
                <li
                  className={`flex gap-1 ${!passwordCriterias[2] ? "text-kfk-red" : ""}`}
                >
                  {passwordCriterias[2] ? (
                    <CheckCircleIcon className="size-5 m-0 text-kfk-green" />
                  ) : (
                    <XCircleIcon className="size-5 m-0" />
                  )}
                  Password contains at least 1 lowercase character
                </li>
                <li
                  className={`flex gap-1 ${!passwordCriterias[3] ? "text-kfk-red" : ""}`}
                >
                  {passwordCriterias[3] ? (
                    <CheckCircleIcon className="size-5 m-0 text-kfk-green" />
                  ) : (
                    <XCircleIcon className="size-5 m-0" />
                  )}
                  Password contains at least 1 number
                </li>
                <li
                  className={`flex gap-1 ${!passwordCriterias[4] ? "text-kfk-red" : ""}`}
                >
                  {passwordCriterias[4] ? (
                    <CheckCircleIcon className="size-5 m-0 text-kfk-green" />
                  ) : (
                    <XCircleIcon className="size-5 m-0" />
                  )}
                  Password contains at least 1 special character
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center gap-2">
              <form.Subscribe
                selector={(state) => [
                  state.canSubmit,
                  state.isSubmitting,
                  state.isDirty,
                ]}
                children={([canSubmit, isSubmitting, isDirty]) => (
                  <Button
                    disabled={
                      !isDirty ||
                      !canSubmit ||
                      isSubmitting ||
                      registerMutation.isPending
                    }
                    type="submit"
                    className={`mt-4 ${
                      registerMutation.isPending
                        ? "bg-[#0A2161]"
                        : isDirty && canSubmit
                          ? "bg-kfk-blue"
                          : "bg-[#737A87]"
                    } w-1/2 text-white font-semibold py-3 rounded-full hover:bg-[#005BFF] transition`}
                  >
                    {registerMutation.isPending
                      ? "Creating Account..."
                      : "Create Account"}
                  </Button>
                )}
              />
              <div className="min-h-5">
                {registerMutation.isError && (
                  <p className="text-sm text-kfk-red text-center">
                    {registerMutation.error instanceof Error
                      ? registerMutation.error.message
                      : "Registration failed"}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
