import type { EmailJob, EmailJobPayload } from "common";
import DonorPostClaimConfirmationEmail from "transactional/emails/DonorPostClaimConfirmationEmail";
import DonorPurchaseReminderEmail from "transactional/emails/DonorPurchaseReminderEmail";

export function getEmailJobSubject(payload: EmailJobPayload) {
  switch (payload.type) {
    case "DONOR_POST_CLAIM_CONFIRMATION":
      return "Your KFK gift claim confirmation";
    case "DONOR_PURCHASE_REMINDER":
      return "Reminder: confirm your KFK gift purchases";
    default:
      throw new Error("Unsupported email job payload type");
  }
}

export function renderEmailJobTemplate(params: {
  payload: EmailJobPayload;
  baseUrl?: string;
  donorPortalUrl?: string;
}) {
  switch (params.payload.type) {
    case "DONOR_POST_CLAIM_CONFIRMATION":
      return DonorPostClaimConfirmationEmail({
        payload: params.payload.data,
        baseUrl: params.baseUrl,
      });
    case "DONOR_PURCHASE_REMINDER":
      return DonorPurchaseReminderEmail({
        payload: params.payload.data,
        baseUrl: params.baseUrl,
        donorPortalUrl: params.donorPortalUrl,
      });
    default:
      throw new Error("Unsupported email job payload type");
  }
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
