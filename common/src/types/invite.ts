import { z } from "zod";
import { UserRole } from "./user.js";

export const StaffInviteSchema = z.object({
  id: z.string(),
  sentBy: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum([UserRole.ADMIN, UserRole.VOLUNTEER]),
  createdAt: z.string(),
  used: z.boolean(),
});

export type StaffInvite = z.infer<typeof StaffInviteSchema>;
