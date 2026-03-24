import type { UserRole } from "./user.js";

export interface StaffInvite {
  id: string;
  sentBy: string;
  name: string;
  email: string;
  role: UserRole.ADMIN | UserRole.VOLUNTEER;
  createdAt: string;
  used: boolean;
}
