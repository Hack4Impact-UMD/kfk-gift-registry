import { createServerOnlyFn } from "@tanstack/react-start";
import admin from "firebase-admin";
import type {
  Child,
  Claim,
  Family,
  FamilyLink,
  Gift,
  GiftDrive,
  ChildProfileUpdate,
  StaffInvite,
  UserProfile,
} from "common";
import {
  CHILD_COLLECTION,
  CLAIM_COLLECTION,
  FAMILY_COLLECTION,
  FAMILY_LINK_COLLECTION,
  GIFT_COLLECTION,
  GIFT_DRIVE_COLLECTION,
  INVITE_COLLECTION,
  PROFILE_UPDATE_COLLECTION,
  USER_COLLECTION,
} from "@/data/collections";

const converter = <T>() => ({
  toFirestore: (data: FirebaseFirestore.WithFieldValue<T>) =>
    data as FirebaseFirestore.DocumentData,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
    snap.data() as T,
});

type Collection<T> = FirebaseFirestore.CollectionReference<
  T,
  FirebaseFirestore.DocumentData
>;
type Database = {
  users: Collection<UserProfile>;
  families: Collection<Family>;
  children: Collection<Child>;
  gifts: Collection<Gift>;
  claims: Collection<Claim>;
  giftDrives: Collection<GiftDrive>;
  invites: Collection<StaffInvite>;
  familyLinks: Collection<FamilyLink>;
  profileUpdates: Collection<ChildProfileUpdate>;
  _instance: FirebaseFirestore.Firestore;
};

let auth: admin.auth.Auth | null = null;
let db: Database | null = null;

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT ?? "kfk-gift-registry",
  });
}

export const getServerAuth = createServerOnlyFn(() => {
  if (auth) return auth;
  auth = admin.auth();
  return auth;
});

export const getServerDB = createServerOnlyFn(() => { 
  if (db) return db;
  const firestore = admin.firestore();

  const collection = <T>(path: string) =>
    firestore.collection(path).withConverter(converter<T>());

  db = {
    users: collection<UserProfile>(USER_COLLECTION),
    children: collection<Child>(CHILD_COLLECTION),
    claims: collection<Claim>(CLAIM_COLLECTION),
    families: collection<Family>(FAMILY_COLLECTION),
    familyLinks: collection<FamilyLink>(FAMILY_LINK_COLLECTION),
    gifts: collection<Gift>(GIFT_COLLECTION),
    giftDrives: collection<GiftDrive>(GIFT_DRIVE_COLLECTION),
    invites: collection<StaffInvite>(INVITE_COLLECTION),
    profileUpdates: collection<ChildProfileUpdate>(PROFILE_UPDATE_COLLECTION),
    _instance: firestore,
  };
  return db;
});
