export enum UserRole {
  ADMIN = "ADMIN",
  DONOR = "DONOR",
  VOLUNTEER = "VOLUNTEER"
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  enabled: boolean;
}
