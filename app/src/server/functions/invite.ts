import { createServerFn } from "@tanstack/react-start";
import type { StaffInvite } from "common";
import { getServerDB } from "@/lib/firebase.server";
import { DateTime } from "luxon";

export const getStaffInviteById = createServerFn({ method: "GET" })
  .inputValidator((data: { inviteId: string }) => data)
  .handler(async ({ data }) => {
    const db = getServerDB();

    const inviteRef = db.invites.doc(data.inviteId);
    const inviteSnap = await inviteRef.get();

    if (!inviteSnap.exists) {
      throw new Error("Invite not found");
    }

    const invite = inviteSnap.data() as StaffInvite;

    if (!invite) {
      throw new Error("Invite not found");
    }

    if (invite.used) {
      throw new Error("Invite already used");
    }

    const dateCreated = DateTime.fromISO(invite.createdAt);
    if (!dateCreated.isValid) {
      throw new Error("Invalid invite createdAt");
    }
    const expired = dateCreated < DateTime.now().minus({ days: 7 });
    if (expired) {
      throw new Error("Invite not created in past 7 days");
    }

    return { ...inviteSnap.data(), id: inviteSnap.id } as StaffInvite;
  });
