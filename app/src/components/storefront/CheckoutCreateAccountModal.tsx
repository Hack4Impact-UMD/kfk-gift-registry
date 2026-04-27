import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import {
  CheckCircleIcon,
  InboxIcon,
  KeyIcon,
  PhoneIcon,
  UserCircleIcon,
  XCircleIcon,
} from "@/components/icons";
import { CheckoutFieldInput } from "./CheckoutFieldInput";
import type {
  CheckoutFlowState,
  RegisterDonorInput,
} from "@/hooks/useCheckoutFlow";

export function CheckoutCreateAccountModal({
  flow,
}: {
  flow: CheckoutFlowState;
}) {
  const [passwordCriterias, setPasswordCriterias] = useState<Array<boolean>>([
    false,
    false,
    false,
    false,
    false,
  ]);

  const form = useForm({
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      const registrationData: RegisterDonorInput = {
        name: value.fullName,
        phone: value.phoneNumber,
        email: value.email,
        password: value.password,
      };
      await flow.submitRegister(registrationData);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-5 text-left"
    >
      {/* Full Name Field */}
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
            <CheckoutFieldInput
              field={field}
              placeholder="e.g. Jane Doe"
              startIcon={<UserCircleIcon className="size-5 fill-current" />}
            />
          )}
        />
      </div>

      {/* Phone Number Field */}
      <div>
        <label className="font-semibold">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <form.Field
          name="phoneNumber"
          validators={{
            onChange: ({ value }) => {
              if (!value || value === "") return "This field is required";
              if (!/^\+[1-9]\d{1,14}$/.test(value))
                return "Phone must be in E.164 format (e.g. +12223334444)";
              return undefined;
            },
          }}
          children={(field) => (
            <CheckoutFieldInput
              field={field}
              placeholder="e.g. +12223334444"
              startIcon={<PhoneIcon className="size-5 fill-current" />}
            />
          )}
        />
      </div>

      {/* Email Field */}
      <div>
        <label className="font-semibold">
          Email <span className="text-red-500">*</span>
        </label>
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              if (!value) return "Email is required";

              const emailRegex =
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

              return !emailRegex.test(value)
                ? "Please enter a valid email address"
                : undefined;
            },
          }}
          children={(field) => (
            <CheckoutFieldInput
              field={field}
              placeholder="e.g. janedoe@gmail.com"
              startIcon={<InboxIcon className="size-5 fill-current" />}
            />
          )}
        />
      </div>

      {/* Password Field */}
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
            <CheckoutFieldInput
              type="password"
              field={field}
              placeholder="e.g. ••••••••••••••••••••••••••"
              startIcon={<KeyIcon className="size-5" />}
            />
          )}
        />
      </div>

      {/* Confirm Password Field */}
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
            onChangeListenTo: ["password"],
          }}
          children={(field) => (
            <CheckoutFieldInput
              type="password"
              field={field}
              placeholder="e.g. ••••••••••••••••••••••••••"
              startIcon={<KeyIcon className="size-5" />}
            />
          )}
        />
      </div>

      <form.Subscribe
        selector={(state) => [
          state.canSubmit,
          state.fieldMeta.password?.isTouched,
          state.fieldMeta.password?.isDirty,
        ]}
      >
        {([canSubmit, isTouched, isDirty]) => {
          const isPasswordPristine = !isTouched && !isDirty;

          return (
            <>
              <div>
                <ul
                  className={`flex flex-col gap-3 text-sm mt-2 ${isPasswordPristine ? "[&_li]:text-gray-800!" : ""}`}
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
              <Button
                type="submit"
                disabled={!canSubmit || flow.isPending}
                className="w-full bg-kfk-blue hover:bg-[#152885] text-white rounded-full h-10 mt-4"
              >
                {flow.isPending ? "Processing..." : "Create Account"}
              </Button>
            </>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
