import type { StorefrontGift } from "@/types/storefront";

export interface GiftTableProps {
  gifts: Array<StorefrontGift>;
  className?: string;
}

export interface GiftTableMeta {
  claimedGifts: Set<string>;
  isGiftClaimed: (gift: StorefrontGift) => boolean;
  onClaimGift: (giftId: string) => void;
}
