import type { StorefrontGift } from "@/types/storefront";

export interface GiftTableProps {
  gifts: Array<StorefrontGift>;
  className?: string;
}

export interface GiftTableMeta {
  isGiftAlreadyClaimed: (gift: StorefrontGift) => boolean;
  isGiftClaimed: (gift: StorefrontGift) => boolean;
  isGiftLocallyClaimed: (giftId: string) => boolean;
  onToggleClaimGift: (
    giftId: string,
    childId: string,
    familyId: string,
  ) => void;
}
