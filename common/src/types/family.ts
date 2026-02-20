export interface Family {
  id: string;
  contactName: string;
  email: string;
  phone: string;
  address: Address;
  privateNotes?: string;
  giftDrive: string;
}

export type Address = {
  street: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
};
