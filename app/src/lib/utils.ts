import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";
import type { GiftDrive } from "common";
import { DateTime } from "luxon";

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export function closestDrive(drives: Array<GiftDrive>) {
  return [...drives].sort((a, b) => {
    const aStart = DateTime.fromISO(a.startDate);
    const bStart = DateTime.fromISO(b.startDate);
    return (
      Math.abs(aStart.diffNow().as("days")) -
      Math.abs(bStart.diffNow().as("days"))
    );
  })[0];
}
