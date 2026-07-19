import { createServerFn } from "@tanstack/react-start";
import { Resend } from "resend";
import { StaffInviteEmail } from "transactional";
import { UserRole } from "common";
import z from "zod";
import { getServerDB } from "@/lib/firebase.server";
import { DateTime } from "luxon";
import { requireRolesMiddleware } from "@/server/middleware/authMiddleware";

export const getStaffInviteById = createServerFn({ method: "GET" })
  .inputValidator((data: { inviteId: string }) => data)
  .handler(async ({ data }) => {
    const db = getServerDB();

    const inviteRef = db.invites.doc(data.inviteId);
    const inviteSnap = await inviteRef.get();

    if (!inviteSnap.exists) {
      throw new Error("Invite not found");
    }

    const invite = inviteSnap.data();

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

    return invite;
  });

const createInviteInputSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  role: z.enum([UserRole.DIRECTOR, UserRole.ADMIN, UserRole.VOLUNTEER]),
});

export const createStaffInvite = createServerFn({ method: "POST" })
  .middleware([requireRolesMiddleware([UserRole.DIRECTOR, UserRole.ADMIN])])
  .inputValidator(createInviteInputSchema)
  .handler(async ({ data, context }) => {
    const { name, email, role } = data;
    const { authUser } = context;

    if (authUser.role === UserRole.ADMIN && role === UserRole.DIRECTOR) {
      throw new Error("Admins cannot invite directors");
    }

    const db = getServerDB();
    const inviteRef = db.invites.doc();

    const invite = {
      id: inviteRef.id,
      sentBy: authUser.uid,
      name,
      email,
      role,
      createdAt: DateTime.now().toISO(),
      used: false,
    };

    await inviteRef.set(invite);

    const baseUrl =
      process.env.APP_BASE_URL ?? "https://gifts.kissesforkyle.org";
    const inviteLink = `${baseUrl}/signup/admin/${inviteRef.id}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "Kisses for Kyle Gift Registry <noreply@gifts.kissesforkyle.org>",
      to: email,
      subject: "You've been invited to join KFK Gift Registry",
      react: StaffInviteEmail({ name, role, inviteLink, baseUrl }),
    });

    if (error) {
      await inviteRef.delete();
      console.error(
        `Invite email failed to send: ${error.name} - ${error.message}`,
      );
      throw new Error(`${error.name} - ${error.message}`);
    }

    return invite;
  });
