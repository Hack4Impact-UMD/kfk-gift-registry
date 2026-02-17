export enum UserRole {
  ADMIN = "ADMIN",
  DONOR = "DONOR"
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  createdAt: string;

}
