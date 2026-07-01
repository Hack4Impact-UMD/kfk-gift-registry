/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onSchedule } from "firebase-functions/scheduler";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";
import type { EmailJob } from "../../common/src/types/email-job";
import { Resend } from "resend";
import { getEmailJobContent } from "../../transactional/email";

setGlobalOptions({ maxInstances: 10 });

if (!admin.apps.length) {
  admin.initializeApp();
  admin.firestore().settings({
    ignoreUndefinedProperties: true,
  });
}

const db = admin.firestore();
const EMAIL_COLLECTION = "emails";
const RESEND_SCHEDULING_WINDOW_DAYS = 30;
const DEFAULT_APP_BASE_URL = "https://gifts.kissesforkyle.org";
const FROM_EMAIL =
  "Kisses for Kyle Gift Registry <noreply@gifts.kissesforkyle.org>";

type ScheduledEmailJob = EmailJob;

function getAppBaseUrl() {
  const raw = process.env.APP_BASE_URL ?? DEFAULT_APP_BASE_URL;
  return raw.replace(/\/+$/, "");
}

function getDonorPortalUrl() {
  return `${getAppBaseUrl()}/donor/home`;
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  return new Resend(apiKey);
}

async function markJobScheduled(jobId: string, resendEmailId?: string) {
  const scheduledAt = new Date().toISOString();
  await db.collection(EMAIL_COLLECTION).doc(jobId).update({
    status: "scheduled",
    resendEmailId,
    scheduledAt,
    updatedAt: scheduledAt,
  });
}

async function markJobFailed(jobId: string, errorMessage: string) {
  const failedAt = new Date().toISOString();
  await db.collection(EMAIL_COLLECTION).doc(jobId).update({
    status: "failed",
    failedAt,
    lastError: errorMessage,
    updatedAt: failedAt,
  });
}

async function markJobCancelled(jobId: string, reason: string) {
  const cancelledAt = new Date().toISOString();
  await db.collection(EMAIL_COLLECTION).doc(jobId).update({
    status: "cancelled",
    cancelledAt,
    lastError: reason,
    updatedAt: cancelledAt,
  });
}

async function shouldCancelReminder(job: ScheduledEmailJob) {
  if (job.payload.type !== "DONOR_PURCHASE_REMINDER") {
    return false;
  }

  const claimIds = job.payload.data.claimIds;
  if (!claimIds?.length) {
    throw new Error("Purchase reminder job is missing claimIds");
  }

  const claimSnapshots = await Promise.all(
    claimIds.map((claimId: string) =>
      db.collection("claims").doc(claimId).get(),
    ),
  );

  const activeClaims = claimSnapshots
    .filter((snapshot: FirebaseFirestore.DocumentSnapshot) => snapshot.exists)
    .map((snapshot: FirebaseFirestore.DocumentSnapshot) => snapshot.data())
    .filter(Boolean) as Array<{
    active?: boolean;
    purchaseConfirmation?: { date?: string };
  }>;

  if (activeClaims.length === 0) {
    return true;
  }

  return activeClaims.every(
    (claim) =>
      claim.active === false || Boolean(claim.purchaseConfirmation?.date),
  );
}

export const promotePendingEmailJobs = onSchedule(
  "every day 00:00",
  async () => {
    const latestSendAt = new Date(
      Date.now() + RESEND_SCHEDULING_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const resend = getResendClient();
    const snapshot = await db
      .collection(EMAIL_COLLECTION)
      .where("status", "==", "pending")
      .where("sendAt", "<=", latestSendAt)
      .get();

    for (const doc of snapshot.docs) {
      const job = doc.data() as ScheduledEmailJob;

      try {
        if (await shouldCancelReminder(job)) {
          await markJobCancelled(job.id, "Reminder no longer needed");
          continue;
        }

        const content = getEmailJobContent({
          job,
          baseUrl: getAppBaseUrl(),
          donorPortalUrl: getDonorPortalUrl(),
        });

        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: job.to,
          subject: content.subject,
          react: content.react,
          scheduledAt: job.sendAt,
        });

        if (error) {
          throw new Error(`${error.name} - ${error.message}`);
        }

        await markJobScheduled(job.id, data?.id);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Failed to promote pending email job", {
          jobId: job.id,
          message,
        });
        await markJobFailed(job.id, message);
      }
    }
  },
);
