export type ApprovedProfileTableRow = {
  id: string;
  childName: string;
  profilePictureUrl?: string;
  parentGuardian: string;
  email: string;
  age: number;
  diagnosis: string;
  type: "warrior" | "supersib";
  giftsFulfilled: number;
  giftsTotal: number;
};
