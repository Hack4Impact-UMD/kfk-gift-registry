import { z } from "zod";

export const GiftDriveSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  cycle: z.string(),
  formLinksDeactivatedAt: z.iso.datetime().optional(),
});

export type GiftDrive = z.infer<typeof GiftDriveSchema>;

export const GiftDriveInputSchema = GiftDriveSchema.omit({
  id: true,
  createdAt: true,
  formLinksDeactivatedAt: true,
})
  .extend({
    cycle: z.string().trim().min(1, "Cycle is required"),
  })
  .refine(
    ({ startDate, endDate }) => Date.parse(startDate) < Date.parse(endDate),
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export type GiftDriveInput = z.infer<typeof GiftDriveInputSchema>;

export const GiftDriveUpdateSchema = GiftDriveInputSchema.extend({
  id: z.string(),
});

export type GiftDriveUpdate = z.infer<typeof GiftDriveUpdateSchema>;
