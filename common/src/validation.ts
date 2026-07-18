import { z } from "zod";

export const MAX_CHILD_PUBLIC_BLURB_LENGTH = 150;
export const MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH = 150;
export const MAX_GIFT_TITLE_LENGTH = 50;
export const MAX_GIFT_PRICE = 30;

export const CHILD_PUBLIC_BLURB_TOO_LONG_MESSAGE = `Personal blurb must be ${MAX_CHILD_PUBLIC_BLURB_LENGTH} characters or fewer.`;
export const GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE = `Gift notes must be ${MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH} characters or fewer.`;
export const GIFT_TITLE_TOO_LONG_MESSAGE = `Gift name must be ${MAX_GIFT_TITLE_LENGTH} characters or fewer.`;
export const GIFT_TITLE_REQUIRED_MESSAGE = "Gift name is required.";
export const GIFT_PRICE_INVALID_MESSAGE = `Price must be a valid non-negative number no greater than $${MAX_GIFT_PRICE}.`;
export const AMAZON_PRODUCT_URL_INVALID_MESSAGE =
  "Please enter a valid Amazon product URL.";

const AMAZON_PRODUCT_URL_RE =
  /^https?:\/\/(?:www\.)?amazon\.com\/(?:[^\s?#]+\/)*(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?#].*)?$/i;

export const ChildPublicBlurbSchema = z
  .string()
  .max(MAX_CHILD_PUBLIC_BLURB_LENGTH, CHILD_PUBLIC_BLURB_TOO_LONG_MESSAGE);

export const GiftFamilyPublicNotesSchema = z
  .string()
  .max(
    MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH,
    GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE,
  )
  .transform((value) => value.trim());

export const GiftTitleSchema = z
  .string()
  .max(MAX_GIFT_TITLE_LENGTH, GIFT_TITLE_TOO_LONG_MESSAGE);

export const NormalizedGiftTitleSchema = GiftTitleSchema.transform((value) =>
  value.trim(),
);

export const RequiredGiftTitleSchema = NormalizedGiftTitleSchema.refine(
  (value) => value.length > 0,
  {
    message: GIFT_TITLE_REQUIRED_MESSAGE,
  },
);

export function isChildPublicBlurbTooLong(value: string | undefined) {
  return (value?.length ?? 0) > MAX_CHILD_PUBLIC_BLURB_LENGTH;
}

export function isGiftFamilyPublicNotesTooLong(value: string | undefined) {
  return (value?.length ?? 0) > MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH;
}

export function isGiftTitleTooLong(value: string) {
  return value.length > MAX_GIFT_TITLE_LENGTH;
}

export function getGiftTitleTooLongCounterMessage(length: number) {
  return `Gift name is too long: ${length}/${MAX_GIFT_TITLE_LENGTH} characters`;
}

export function normalizeAmazonProductUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  if (!/^[a-z][a-z0-9+\-.]*:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export function isValidAmazonProductUrl(rawUrl: string) {
  return AMAZON_PRODUCT_URL_RE.test(normalizeAmazonProductUrl(rawUrl));
}
