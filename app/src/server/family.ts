import { createServerFn } from "@tanstack/react-start";
import { randomBytes } from "node:crypto";
import z from "zod";
import { getServerDB } from "@/lib/firebase.server";

const familyInputSchema = z.object({
  parentName: z.string().trim().min(1),
  childName: z.string().trim().min(1),
  email: z.string().trim().email(),
  diagnosis: z.string().trim().min(1),
});

const tokenInputSchema = z.object({
  token: z.string().min(1),
});

export type FamilyProfile = z.infer<typeof familyInputSchema>;

export const createFamily = createServerFn({ method: "POST" })
  .inputValidator(familyInputSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const now = new Date();

    const familyRef = await db.collection("families").add({
      ...data,
      createdAt: now,
    });

    const token = randomBytes(32).toString("hex");

    await db.collection("familyAccessTokens").add({
      token,
      familyId: familyRef.id,
      active: true,
      createdAt: now,
    });

    return { token };
  });

export const getFamilyByToken = createServerFn({ method: "GET" })
  .inputValidator(tokenInputSchema)
  .handler(async ({ data }) => {
    const { token } = data;

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      throw new Error("Invalid link");
    }

    const db = getServerDB();
    const tokenSnap = await db
      .collection("familyAccessTokens")
      .where("token", "==", token)
      .where("active", "==", true)
      .limit(1)
      .get();

    if (tokenSnap.empty) {
      throw new Error("Invalid link");
    }

    const tokenData = tokenSnap.docs[0].data() as { familyId?: string };
    if (!tokenData.familyId) {
      throw new Error("Invalid link");
    }

    const familyDoc = await db.collection("families").doc(tokenData.familyId).get();

    if (!familyDoc.exists) {
      throw new Error("Family not found");
    }

    const familyData = familyDoc.data() as FamilyProfile | undefined;
    if (!familyData) {
      throw new Error("Family not found");
    }

    return {
      parentName: familyData.parentName,
      childName: familyData.childName,
      email: familyData.email,
      diagnosis: familyData.diagnosis,
    };
  });
