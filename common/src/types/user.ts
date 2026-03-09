export enum UserRole {
  DIRECTOR = "DIRECTOR",
  ADMIN = "ADMIN",
  VOLUNTEER = "VOLUNTEER",
  DONOR = "DONOR",
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  enabled: boolean;
}
