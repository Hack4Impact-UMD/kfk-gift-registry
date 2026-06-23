import type React from "react";
import { Input } from "@/components/ui/input";

/** Converts a display-formatted or raw digit string to E.164 (+1XXXXXXXXXX). */
export function formatToE164(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

/** Converts an E.164 US number (+1XXXXXXXXXX) to display format (555)-555-5555. */
export function e164ToDisplay(e164: string): string {
  if (!e164) return "";
  const digits = e164.replace(/\D/g, "");
  const local =
    digits.startsWith("1") && digits.length === 11 ? digits.slice(1) : digits;
  if (local.length !== 10) return e164;
  return `(${local.slice(0, 3)})-${local.slice(3, 6)}-${local.slice(6)}`;
}

/**
 * Drop-in replacement for Input that auto-formats to (555)-555-5555 as the
 * user types and emits the formatted value through the standard onChange event.
 */
export function PhoneInput({
  onChange,
  ...props
}: React.ComponentProps<typeof Input>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e164ToDisplay(e.target.value);
    onChange?.({
      ...e,
      target: { ...e.target, value: formatted },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return <Input onChange={handleChange} {...props} />;
}
