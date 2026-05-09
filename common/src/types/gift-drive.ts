import { z } from "zod";

export const GiftDriveSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  cycle: z.string(),
});

export type GiftDrive = z.infer<typeof GiftDriveSchema>;
