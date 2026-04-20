export interface Family {
  id: string;
  contactName: string;
  guardianRelationship?: string;
  email: string;
  phone: string;
  address: Address;
  privateNotes?: string;
  giftDrive: string;
  createdAt: string;
  reviewStatus: {
    approved: boolean;
    held: boolean;
    lastReviewedAt?: string;
    reviewedBy?: string;
    reviewNotes?: string;
    holdNotes?: string;
  };
}

export type Address = {
  street: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
};
