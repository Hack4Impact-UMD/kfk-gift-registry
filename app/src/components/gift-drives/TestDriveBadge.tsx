import type { GiftDrive } from "common";
import { cn } from "@/lib/utils";

/** Flags test drives wherever a drive's name is shown. */
export function TestDriveBadge({
  drive,
  size = "default",
  className,
}: {
  drive: Pick<GiftDrive, "isTestDrive">;
  /** `sm` fits inline in select items and triggers. */
  size?: "default" | "sm";
  className?: string;
}) {
  if (!drive.isTestDrive) return null;
  return (
    <span
      data-testid="test-drive-badge"
      className={cn(
        "inline-flex shrink-0 items-center rounded-full bg-kfk-yellow/30 font-sans leading-none font-semibold text-black",
        size === "sm"
          ? "px-1.5 py-0.5 align-middle text-[10px]"
          : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      Test drive
    </span>
  );
}
