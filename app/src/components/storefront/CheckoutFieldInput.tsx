import { useState } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

type CheckoutFieldInputProps = {
  type?: string;
  field: AnyFieldApi;
  placeholder: string;
  disabled?: boolean;
  startIcon: React.ReactNode;
};

export function CheckoutFieldInput({
  type,
  field,
  placeholder,
  disabled,
  startIcon,
}: CheckoutFieldInputProps) {
  const [showPassword, setShowPassword] = useState(false);
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

        <Input
          type={inputType}
          name={field.name}
          id={field.name}
          value={field.state.value}
          placeholder={placeholder}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? `${field.name}-error` : undefined}
          className={`w-full border border-muted-foreground rounded-md px-3 pl-8 py-2 mt-1 
            ${isPassword ? "pr-9" : ""} ${errorMessage ? "border-red-500 bg-[#FFF0F0] placeholder:text-red-500 text-red-500" : ""}`}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          disabled={disabled}
        />

        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </Button>
        )}
      </div>
      {errorMessage && (
        <span
          id={`${field.name}-error`}
          role="alert"
          className="text-xs text-red-500 mt-1 -mb-2 block pl-1"
        >
          {errorMessage}
        </span>
      )}
    </>
  );
}
