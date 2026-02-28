import type { UserRole } from "./user.js";

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
