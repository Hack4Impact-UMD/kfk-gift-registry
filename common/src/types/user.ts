import { z } from "zod";

export enum UserRole {
  DIRECTOR = "DIRECTOR",
  ADMIN = "ADMIN",
  VOLUNTEER = "VOLUNTEER",
  DONOR = "DONOR",
}

export const UserRoleSchema = z.nativeEnum(UserRole);

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: UserRoleSchema,
  phone: z.string().optional(),
  createdAt: z.string(),
  enabled: z.boolean(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
