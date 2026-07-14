import type { EmailJob, EmailJobPayload } from "common";
import {
  DonorPostClaimConfirmationEmail,
  DonorPurchaseReminderEmail,
} from "transactional";

function getEmailJobSubject(payload: EmailJobPayload) {
  if (payload.type === "DONOR_POST_CLAIM_CONFIRMATION") {
    return "Your KFK gift claim confirmation";
  }

  if (payload.type === "DONOR_PURCHASE_REMINDER") {
    return "Reminder: confirm your KFK gift purchases";
  }

  throw new Error("Unsupported email job payload type");
}

function renderEmailJobTemplate(params: {
  payload: EmailJobPayload;
  baseUrl: string;
  donorPortalUrl: string;
}) {
  if (params.payload.type === "DONOR_POST_CLAIM_CONFIRMATION") {
    return DonorPostClaimConfirmationEmail({
      payload: params.payload.data,
      baseUrl: params.baseUrl,
      donorPortalUrl: params.donorPortalUrl,
    });
  }

  if (params.payload.type === "DONOR_PURCHASE_REMINDER") {
    return DonorPurchaseReminderEmail({
      payload: params.payload.data,
      baseUrl: params.baseUrl,
      donorPortalUrl: params.donorPortalUrl,
    });
  }

  throw new Error("Unsupported email job payload type");
}

export function getEmailJobContent(params: {
  job: Pick<EmailJob, "payload" | "subject">;
  baseUrl: string;
  donorPortalUrl: string;
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
