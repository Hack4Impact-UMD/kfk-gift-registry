import { DateTime } from "luxon";
import { Resend } from "resend";
import type { EmailJob } from "common";
import { getServerDB } from "@/lib/firebase.server";

const RESEND_SCHEDULING_WINDOW_DAYS = 30;
const DEFAULT_APP_BASE_URL = "https://gifts.kissesforkyle.org";
const FROM_EMAIL =
  "Kisses for Kyle Gift Registry <noreply@gifts.kissesforkyle.org>";

export function getAppBaseUrl() {
  const raw = process.env.APP_BASE_URL ?? DEFAULT_APP_BASE_URL;
  return raw.replace(/\/+$/, "");
}

export function getDonorPortalUrl() {
  return `${getAppBaseUrl()}/donor/home`;
}

function normalizeSendAt(sendAt: string) {
  const scheduledFor = DateTime.fromISO(sendAt);
  if (!scheduledFor.isValid) {
    throw new Error("Invalid sendAt timestamp");
  }

  const normalizedSendAt = scheduledFor.toUTC().toISO();
  if (!normalizedSendAt) {
    throw new Error("Failed to normalize sendAt timestamp");
  }

  return normalizedSendAt;
}

function canScheduleDirectlyWithResend(sendAt: string) {
  const scheduledFor = DateTime.fromISO(sendAt);
  if (!scheduledFor.isValid) {
    throw new Error("Invalid sendAt timestamp");
  }

  return (
    scheduledFor <=
    DateTime.now().plus({
      days: RESEND_SCHEDULING_WINDOW_DAYS,
    })
  );
}

export function createEmailJob(params: {
  id: string;
  to: string;
  subject: string;
  html: string;
  sendAt: string;
  metadata?: Record<string, unknown>;
}): EmailJob {
  const now = DateTime.now().toISO();
  if (!now) {
    throw new Error("Failed to create email job timestamp");
  }

  const normalizedSendAt = normalizeSendAt(params.sendAt);

  return {
    id: params.id,
    to: params.to,
    subject: params.subject,
    html: params.html,
    sendAt: normalizedSendAt,
    status: "pending",
    metadata: params.metadata,
    createdAt: now,
    updatedAt: now,
  };
}

export async function queueEmailJob(job: EmailJob) {
  const db = getServerDB();
  await db.emails.doc(job.id).set(job);
  return job;
}

export async function claimPendingEmailJobForScheduling(jobId: string) {
  const db = getServerDB();
  const claimedAt = DateTime.now().toISO();
  if (!claimedAt) {
    throw new Error("Failed to create claimedAt timestamp");
  }

  return await db._instance.runTransaction(async (transaction) => {
    const jobRef = db.emails.doc(jobId);
    const jobDoc = await transaction.get(jobRef);
    const job = jobDoc.data();

    if (!job) {
      throw new Error("Email job not found");
    }

    if (job.status !== "pending") {
      return false;
    }

    transaction.update(jobRef, {
      status: "scheduling",
      updatedAt: claimedAt,
    });

    return true;
  });
}

export async function markEmailJobScheduled(params: {
  jobId: string;
  resendEmailId?: string;
}) {
  const db = getServerDB();
  const claimed = await claimPendingEmailJobForScheduling(params.jobId);
  if (!claimed) {
    return false;
  }

  const scheduledAt = DateTime.now().toISO();
  if (!scheduledAt) {
    throw new Error("Failed to create scheduledAt timestamp");
  }

  await db.emails.doc(params.jobId).update({
    status: "scheduled",
    resendEmailId: params.resendEmailId,
    scheduledAt,
    updatedAt: scheduledAt,
  });

  return true;
}

export async function markEmailJobFailed(params: {
  jobId: string;
  errorMessage: string;
}) {
  const db = getServerDB();
  const failedAt = DateTime.now().toISO();
  if (!failedAt) {
    throw new Error("Failed to create failedAt timestamp");
  }

  await db.emails.doc(params.jobId).update({
    status: "failed",
    failedAt,
    lastError: params.errorMessage,
    updatedAt: failedAt,
  });
}

export async function sendOrQueueEmailJob(job: EmailJob) {
  await queueEmailJob(job);

  if (!canScheduleDirectlyWithResend(job.sendAt)) {
    return {
      job,
      delivery: "queued" as const,
    };
  }

  return {
    job,
    delivery: "ready_to_schedule" as const,
  };
}

export async function getPendingEmailJobsReadyForResendScheduling() {
  const db = getServerDB();
  const latestSendAt = normalizeSendAt(
    DateTime.now().plus({ days: RESEND_SCHEDULING_WINDOW_DAYS }).toISO() ?? "",
  );

  const snapshot = await db.emails
    .where("status", "==", "pending")
    .where("sendAt", "<=", latestSendAt)
    .get();

  return snapshot.docs.map((doc) => doc.data());
}
export async function sendEmailNow(params: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Skipping email send: RESEND_API_KEY is not set");
    return {
      skipped: true as const,
    };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (error) {
    throw new Error(`${error.name} - ${error.message}`);
  }

  return {
    skipped: false as const,
    id: data?.id,
  };
}
