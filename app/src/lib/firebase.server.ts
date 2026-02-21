import { createServerOnlyFn } from "@tanstack/react-start";
import admin from "firebase-admin";
import type { Child, Claim, Family, FamilyLink, Gift, GiftDrive, StaffInvite, UserProfile } from "common";
import { CHILD_COLLECTION, CLAIM_COLLECTION, FAMILY_COLLECTION, FAMILY_LINK_COLLECTION, GIFT_COLLECTION, GIFT_DRIVE_COLLECTION, INVITE_COLLECTION, USER_COLLECTION } from "@/data/collections";

const converter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) => snap.data() as T
})

type Collection<T> = FirebaseFirestore.CollectionReference<T, FirebaseFirestore.DocumentData>
type Database = {
  users: Collection<UserProfile>,
  families: Collection<Family>,
  children: Collection<Child>,
  gifts: Collection<Gift>,
  claims: Collection<Claim>,
  giftDrives: Collection<GiftDrive>,
  invites: Collection<StaffInvite>,
  familyLinks: Collection<FamilyLink>
}

let auth: admin.auth.Auth | null = null;
let db: Database | null = null;

if (!admin.apps.length) {
  admin.initializeApp();
}

export const getServerAuth = createServerOnlyFn(() => {
  if (auth) return auth;
  auth = admin.auth();
  return auth;
});

export const getServerDB = createServerOnlyFn(() => {
  if (db) return db;
  const firestore = admin.firestore();
  db = {
    users: firestore.collection(USER_COLLECTION).withConverter(converter<UserProfile>()),
    children: firestore.collection(CHILD_COLLECTION).withConverter(converter<Child>()),
    claims: firestore.collection(CLAIM_COLLECTION).withConverter(converter<Claim>()),
    families: firestore.collection(FAMILY_COLLECTION).withConverter(converter<Family>()),
    familyLinks: firestore.collection(FAMILY_LINK_COLLECTION).withConverter(converter<FamilyLink>()),
    gifts: firestore.collection(GIFT_COLLECTION).withConverter(converter<Gift>()),
    giftDrives: firestore.collection(GIFT_DRIVE_COLLECTION).withConverter(converter<GiftDrive>()),
    invites: firestore.collection(INVITE_COLLECTION).withConverter(converter<StaffInvite>()),
  }
  return db;
});
