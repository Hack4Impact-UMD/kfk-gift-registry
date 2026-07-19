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
import type { EmailJob } from "common";
import { Resend } from "resend";

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
const FROM_EMAIL =
  "Kisses for Kyle Gift Registry <noreply@gifts.kissesforkyle.org>";

type ScheduledEmailJob = EmailJob;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  return new Resend(apiKey);
}

async function claimPendingJob(jobId: string) {
  const claimedAt = new Date().toISOString();

  return await db.runTransaction(async (transaction) => {
    const jobRef = db.collection(EMAIL_COLLECTION).doc(jobId);
    const jobDoc = await transaction.get(jobRef);
    const job = jobDoc.data() as ScheduledEmailJob | undefined;

    if (!job) {
      return false;
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

/**
 * Generic, content-agnostic cancellation check: if the caller attached
 * `claimIds` to a job's metadata, cancel the job once every referenced
 * claim is inactive or already confirmed. Jobs without this metadata are
 * never auto-cancelled.
 */
async function shouldCancelJob(job: ScheduledEmailJob) {
  const claimIds = job.metadata?.claimIds;
  if (!Array.isArray(claimIds) || claimIds.length === 0) {
    return false;
  }

  const claimSnapshots = await Promise.all(
    (claimIds as unknown[])
      .filter((claimId): claimId is string => typeof claimId === "string")
      .map((claimId) => db.collection("claims").doc(claimId).get()),
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
        const claimed = await claimPendingJob(job.id);
        if (!claimed) {
          continue;
        }

        if (await shouldCancelJob(job)) {
          await markJobCancelled(job.id, "Job no longer needed");
          continue;
        }

        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: job.to,
          subject: job.subject,
          html: job.html,
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
