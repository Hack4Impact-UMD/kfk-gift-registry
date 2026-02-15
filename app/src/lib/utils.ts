import {  clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type {ClassValue} from "clsx";

/**
 * Builds a space-separated class string from clsx-style inputs and resolves Tailwind utility conflicts.
 *
 * @param inputs - Values accepted by `clsx` (strings, objects, arrays) representing CSS class names
 * @returns The resulting merged class string with Tailwind utility conflicts resolved
 */
export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}