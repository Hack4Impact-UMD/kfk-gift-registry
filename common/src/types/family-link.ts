import { z } from "zod";

export const FamilyLinkSchema = z.object({
  id: z.string(),
  familyId: z.string(),
  active: z.boolean(),
});

export type FamilyLink = z.infer<typeof FamilyLinkSchema>;
