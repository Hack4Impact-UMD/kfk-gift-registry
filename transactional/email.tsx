import type {
  EmailJob,
  EmailJobPayload,
} from "../common/src/types/email-job";
import z from "zod";
import DonorPostClaimConfirmationEmail from "./emails/DonorPostClaimConfirmationEmail";
import DonorPurchaseReminderEmail from "./emails/DonorPurchaseReminderEmail";

const RenderEmailJobTemplateParamsSchema = z.object({
  payload: z.custom<EmailJobPayload>(),
  baseUrl: z.url(),
  donorPortalUrl: z.url(),
});

export function getEmailJobSubject(payload: EmailJobPayload) {
  if (payload.type === "DONOR_POST_CLAIM_CONFIRMATION") {
    return "Your KFK gift claim confirmation";
  }

  if (payload.type === "DONOR_PURCHASE_REMINDER") {
    return "Reminder: confirm your KFK gift purchases";
  }

  throw new Error("Unsupported email job payload type");
}

export function renderEmailJobTemplate(params: {
  payload: EmailJobPayload;
  baseUrl?: string;
  donorPortalUrl?: string;
}) {
  const parsedParams = RenderEmailJobTemplateParamsSchema.parse(params);

  if (parsedParams.payload.type === "DONOR_POST_CLAIM_CONFIRMATION") {
    return DonorPostClaimConfirmationEmail({
      payload: parsedParams.payload.data,
      baseUrl: parsedParams.baseUrl,
      donorPortalUrl: parsedParams.donorPortalUrl,
    });
  }

  if (parsedParams.payload.type === "DONOR_PURCHASE_REMINDER") {
    return DonorPurchaseReminderEmail({
      payload: parsedParams.payload.data,
      baseUrl: parsedParams.baseUrl,
      donorPortalUrl: parsedParams.donorPortalUrl,
    });
  }

  throw new Error("Unsupported email job payload type");
}

export function getEmailJobContent(params: {
  job: Pick<EmailJob, "payload" | "subject">;
  baseUrl?: string;
  donorPortalUrl?: string;
}) {
  return {
    subject: params.job.subject || getEmailJobSubject(params.job.payload),
    react: renderEmailJobTemplate({
      payload: params.job.payload,
      baseUrl: params.baseUrl,
      donorPortalUrl: params.donorPortalUrl,
    }),
  };
}
