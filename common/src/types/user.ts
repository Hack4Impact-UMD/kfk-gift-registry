import { z } from "zod";

export enum UserRole {
  DIRECTOR = "DIRECTOR",
  ADMIN = "ADMIN",
  VOLUNTEER = "VOLUNTEER",
  DONOR = "DONOR",
}

export const UserRoleSchema = z.enum(UserRole);

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  role: UserRoleSchema,
  phone: z.e164().optional(),
  createdAt: z.iso.datetime(),
  enabled: z.boolean(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
