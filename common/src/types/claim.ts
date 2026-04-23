export type DonorClaim = {
  id: string;
  claimType: "donor";
  giftId: string;
  childId: string;
  donorId: string;
  driveId: string;
  organizationName?: string;
  claimedAt: string;
  purchaseConfirmation?: ClaimPurchaseConfirmation;
  deliveryConfirmed?: DeliveryConfirmation;
  receivedAt?: string;
  thankYouNote?: string;
  privateNotes?: string;
  expectedDeliveryDate?: string;
  active: boolean;
};

export type KFKClaim = {
  id: string;
  claimType: "kfk";
  giftId: string;
  childId: string;
  driveId: string;
  organizationName?: string;
  claimedAt: string;
  purchaseConfirmation?: ClaimPurchaseConfirmation;
  deliveryConfirmed?: DeliveryConfirmation;
  receivedAt?: string;
  thankYouNote?: string;
  privateNotes?: string;
  expectedDeliveryDate?: string;
  active: boolean;
};

export type Claim = DonorClaim | KFKClaim;

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
