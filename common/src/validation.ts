import { z } from "zod";

export const MAX_CHILD_PUBLIC_BLURB_LENGTH = 150;
export const MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH = 150;
export const MAX_GIFT_TITLE_LENGTH = 50;

export const CHILD_PUBLIC_BLURB_TOO_LONG_MESSAGE = `Personal blurb must be ${MAX_CHILD_PUBLIC_BLURB_LENGTH} characters or fewer.`;
export const GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE = `Gift notes must be ${MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH} characters or fewer.`;
export const GIFT_TITLE_TOO_LONG_MESSAGE = `Gift name must be ${MAX_GIFT_TITLE_LENGTH} characters or fewer.`;
export const GIFT_TITLE_REQUIRED_MESSAGE = "Gift name is required.";

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
