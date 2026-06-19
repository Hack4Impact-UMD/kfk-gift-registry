import { z } from "zod";

export const EmailJobStatusSchema = z.enum([
  "pending",
  "scheduled",
  "sent",
  "failed",
  "cancelled",
]);

export type EmailJobStatus = z.infer<typeof EmailJobStatusSchema>;

/* implementation will utilize either resend or our own cloud func */
export const EmailJobTypeSchema = z.enum([
  "DONOR_POST_CLAIM_CONFIRMATION",
  "DONOR_PURCHASE_REMINDER",
]);

export type EmailJobType = z.infer<typeof EmailJobTypeSchema>;