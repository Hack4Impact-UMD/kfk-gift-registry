import { z } from "zod";

export const GiftDriveSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  cycle: z.string(),
});

export type GiftDrive = z.infer<typeof GiftDriveSchema>;
