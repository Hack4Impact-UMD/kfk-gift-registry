export interface Claim {
  id: string;
  giftId: string;
  childId: string;
  donorId: string;
  organizationName?: string;
  claimedAt: string;
  purchaseConfirmedAt?: ClaimPurchaseConfirmation;
  trackingNumber?: string;
  deliveryConfirmed?: boolean;
  privateNotes?: string;
  expectedDeliveryDate?: string;
  active: boolean;
}
interface ClaimPurchaseConfirmation {
  date: string;
  documentationUrl: string;
}
