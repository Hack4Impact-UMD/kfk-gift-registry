import { DateTime } from "luxon";
import type { EmailJob, EmailJobPayload, EmailJobType } from "common";
import { getServerDB } from "@/lib/firebase.server";

const RESEND_SCHEDULING_WINDOW_DAYS = 30;

function canScheduleDirectlyWithResend(sendAt: string) {
  const scheduledFor = DateTime.fromISO(sendAt);
  if (!scheduledFor.isValid) {
    throw new Error("Invalid sendAt timestamp");
  }

  return scheduledFor <= DateTime.now().plus({
    days: RESEND_SCHEDULING_WINDOW_DAYS,
  });
}

export function createEmailJob(params: {
  id: string;
  type: EmailJobType;
  to: string;
  subject: string;
  payload: EmailJobPayload;
  sendAt: string;
}): EmailJob {
  const now = DateTime.now().toISO();
  if (!now) {
    throw new Error("Failed to create email job timestamp");
  }

  return {
    id: params.id,
    type: params.type,
    to: params.to,
    subject: params.subject,
    payload: params.payload,
    sendAt: params.sendAt,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
}

export async function queueEmailJob(job: EmailJob) {
  const db = getServerDB();
  await db.emails.doc(job.id).set(job);
  return job;
}

export async function markEmailJobScheduled(params: {
  jobId: string;
  resendEmailId?: string;
}) {
  const db = getServerDB();
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
  const latestSendAt = DateTime.now()
    .plus({ days: RESEND_SCHEDULING_WINDOW_DAYS })
    .toISO();

  if (!latestSendAt) {
    throw new Error("Failed to create resend scheduling window timestamp");
  }

  const snapshot = await db.emails
    .where("status", "==", "pending")
    .where("sendAt", "<=", latestSendAt)
    .get();

  return snapshot.docs.map((doc) => doc.data());
}
