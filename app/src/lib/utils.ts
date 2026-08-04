import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";
import type { Claim, GiftDrive } from "common";
import { DateTime } from "luxon";

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export function getFirstNameLastInitial(fullName: string) {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  const lastName = rest.pop();
  return lastName ? `${firstName} ${lastName[0]}.` : firstName;
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

export function getLatestCompletedDrive(
  drives: Array<GiftDrive>,
): GiftDrive | undefined {
  const now = DateTime.utc().toMillis();

  return [...drives]
    .filter((drive) => DateTime.fromISO(drive.endDate).toMillis() < now)
    .sort(
      (a, b) =>
        DateTime.fromISO(b.endDate).toMillis() -
        DateTime.fromISO(a.endDate).toMillis(),
    )[0];
}

export function getNextScheduledDrive(
  drives: Array<GiftDrive>,
): GiftDrive | undefined {
  const now = DateTime.utc().toMillis();

  return [...drives]
    .filter((drive) => DateTime.fromISO(drive.startDate).toMillis() > now)
    .sort(
      (a, b) =>
        DateTime.fromISO(a.startDate).toMillis() -
        DateTime.fromISO(b.startDate).toMillis(),
    )[0];
}

export function isDonorClaim(
  claim: Claim,
): claim is Extract<Claim, { claimType: "donor" }> {
  return claim.claimType === "donor";
}

const _dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatISODate(iso: string | null | undefined): string {
  if (!iso) return "N/A";
  try {
    return _dateFormatter.format(new Date(iso));
  } catch {
    return iso;
  }
}

export const chunk = <T>(items: Array<T>, size: number): Array<Array<T>> => {
  if (size <= 0) throw new Error("Size must be greater than 0");
  const chunks: Array<Array<T>> = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};
