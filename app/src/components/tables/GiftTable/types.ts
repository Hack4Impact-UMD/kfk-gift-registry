import type { StorefrontGift } from "@/types/storefront";

export interface GiftTableProps {
  gifts: StorefrontGift[];
  className?: string;
}

export interface GiftTableMeta {
  claimedGifts: Set<string>;
  onClaimGift: (giftId: string) => void;
}
