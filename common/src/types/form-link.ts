import z from "zod";

export const FormLinkSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  driveId: z.string(),
  active: z.boolean(),
  showOnStorefront: z.boolean(),
});

export type FormLink = z.infer<typeof FormLinkSchema>;
