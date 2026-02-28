export interface Claim {
  id: string;
  giftId: string;
  childId: string;
  donorId: string;
  organizationName?: string;
  claimedAt: string;
  purchaseConfirmation?: ClaimPurchaseConfirmation;
  deliveryConfirmed?: DeliveryConfirmation;
  privateNotes?: string;
  expectedDeliveryDate?: string;
  active: boolean;
}

export interface ClaimPurchaseConfirmation {
  date: string;
  documentationUrl: string;
  verified: boolean; // whether the confirmation has been verified by admin
  trackingNumber?: string;
}

export interface DeliveryConfirmation {
  date: string;
  documentationUrl: string;
  verified: boolean;
}
