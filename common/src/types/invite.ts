import type { UserRole } from "./user";

export interface StaffInvite {
  id: string;
  sentBy: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole.ADMIN | UserRole.VOLUNTEER;
  createdAt: string;
  used: boolean;
}
