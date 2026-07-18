import { render } from "@react-email/render";
import type { DonorPostClaimConfirmationPayload } from "common";
import { DonorPostClaimConfirmationEmail } from "transactional";
import {
  getAppBaseUrl,
  getDonorPortalUrl,
} from "@/server/services/emailService.server";

export async function renderDonorPostClaimConfirmationEmail(
  payload: DonorPostClaimConfirmationPayload,
) {
  const html = await render(
    DonorPostClaimConfirmationEmail({
      payload,
      baseUrl: getAppBaseUrl(),
      donorPortalUrl: getDonorPortalUrl(),
    }),
  );

  return {
    subject: "Your KFK gift claim confirmation",
    html,
  };
}
