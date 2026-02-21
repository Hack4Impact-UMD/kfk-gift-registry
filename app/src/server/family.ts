import { createServerFn } from "@tanstack/react-start";
import z from "zod";

const familyInputSchema = z.object({
  parentName: z.string().trim().min(1),
  childName: z.string().trim().min(1),
  email: z.string().trim().email(),
  diagnosis: z.string().trim().min(1),
});

const tokenInputSchema = z.object({
  token: z.string().min(1),
});

type FamilyInput = z.infer<typeof familyInputSchema>;

export const createFamily = createServerFn({ method: "POST" })
  .inputValidator(familyInputSchema)
  .handler(async ({ data }) => {
    // TODO: implement
  });

export const getFamilyByToken = createServerFn({ method: "GET" })
  .inputValidator(tokenInputSchema)
  .handler(async ({ data }) => {
    // TODO: implement
  });
