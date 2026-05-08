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

export const chunk = <T>(items: Array<T>, size: number): Array<Array<T>> => {
  const chunks: Array<Array<T>> = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};
