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
export const GIFT_LISTING_URL_WARNING_MESSAGE =
  "Double check the link to the gift listing works. If it does, you can ignore this warning for now, but you'll need a direct Amazon or Macy's listing link before continuing.";

const AMAZON_ASIN_RE = /^[A-Z0-9]{10}$/i;
const AMAZON_PRODUCT_PATH_RE =
  /(?:^|\/)(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})(?:[/?#]|$)/i;
const AMAZON_PRODUCT_QUERY_PARAMS = [
  "asin",
  "ASIN",
  "pd_rd_i",
  "creativeASIN",
] as const;
const MACYS_PRODUCT_PATH_RE = /^\/shop\/product(?:\/|$)/i;

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

function normalizeHost(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function isAmazonHost(hostname: string) {
  const normalizedHost = normalizeHost(hostname);
  return (
    normalizedHost === "amazon.com" || normalizedHost.endsWith(".amazon.com")
  );
}

function isAmazonShortHost(hostname: string) {
  const normalizedHost = normalizeHost(hostname);
  return normalizedHost === "a.co" || normalizedHost === "amzn.to";
}

function isMacysHost(hostname: string) {
  const normalizedHost = normalizeHost(hostname);
  return (
    normalizedHost === "macys.com" || normalizedHost.endsWith(".macys.com")
  );
}

function hasAmazonProductQueryParam(url: URL) {
  return AMAZON_PRODUCT_QUERY_PARAMS.some((key) => {
    const value = url.searchParams.get(key);
    return value != null && AMAZON_ASIN_RE.test(value);
  });
}

function isAmazonProductUrl(url: URL) {
  if (!isAmazonHost(url.hostname)) return false;
  return (
    AMAZON_PRODUCT_PATH_RE.test(url.pathname) || hasAmazonProductQueryParam(url)
  );
}

function isAmazonShareUrl(url: URL) {
  return isAmazonShortHost(url.hostname) && url.pathname !== "/";
}

function isMacysProductUrl(url: URL) {
  return isMacysHost(url.hostname) && MACYS_PRODUCT_PATH_RE.test(url.pathname);
}

export function normalizeGiftListingUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  if (!/^[a-z][a-z0-9+\-.]*:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export function isValidGiftListingUrl(rawUrl: string) {
  const normalizedUrl = normalizeGiftListingUrl(rawUrl);
  if (!normalizedUrl) return false;

  try {
    const url = new URL(normalizedUrl);
    return (
      isAmazonProductUrl(url) || isAmazonShareUrl(url) || isMacysProductUrl(url)
    );
  } catch {
    return false;
  }
}

export const normalizeAmazonProductUrl = normalizeGiftListingUrl;
export const isValidAmazonProductUrl = isValidGiftListingUrl;
