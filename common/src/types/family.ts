export interface Family {
  id: string;
  contactName: string;
  email: string;
  phone: string;
  address: Address;
  privateNotes?: string;
  giftDrive: string;
  createdAt: string;
}

export type Address = {
  street: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
};
