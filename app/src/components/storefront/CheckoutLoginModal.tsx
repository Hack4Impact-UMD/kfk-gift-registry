import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { Checkbox } from "@/components/ui/checkbox";
import { InboxIcon, KeyIcon } from "@/components/icons";
import { CheckoutFieldInput } from "@/components/storefront/CheckoutFieldInput";
import { CheckoutFlowState } from "@/hooks/useCheckoutFlow";

export function CheckoutLoginModal({ flow }: { flow: CheckoutFlowState }) {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    onSubmit: async ({ value }) => {
      await flow.submitLogin(value.email, value.password);
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
      {/* Email Field */}
      <div>
        <label className="font-semibold">Email</label>
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
              placeholder="Enter your email"
              startIcon={<InboxIcon className="size-5 fill-current" />}
            />
          )}
        />
      </div>

      {/* Password Field */}
      <div>
        <label className="font-semibold">Password</label>
        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              !value ? "Please enter a password" : undefined,
          }}
          children={(field) => (
            <CheckoutFieldInput
              type="password"
              field={field}
              placeholder="Enter your password"
              startIcon={<KeyIcon className="size-5 fill-current" />}
            />
          )}
        />
      </div>

      {/* Rememeber Me + Forgot Password Field */}
      <form.Field
        name="rememberMe"
        defaultValue={false}
        children={(field) => (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                className="rounded-full"
                checked={field.state.value}
                onCheckedChange={(checked) => {
                  field.handleChange(checked === true);
                }}
              />
              <label htmlFor="remember" className="text-sm text-gray-500">
                Remember me
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-kfk-blue underline font-medium cursor-pointer"
              onClick={() => {
                /* TODO: Navigate to forgot password */
              }}
            >
              Forgot Password?
            </button>
          </div>
        )}
      />

      <form.Subscribe selector={(state) => [state.canSubmit]}>
        {([canSubmit]) => (
          <Button
            type="submit"
            disabled={!canSubmit || flow.isPending}
            className="w-full bg-kfk-blue hover:bg-[#152885] text-white rounded-full h-10 mt-4"
          >
            {flow.isPending ? "Processing..." : "Login"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
