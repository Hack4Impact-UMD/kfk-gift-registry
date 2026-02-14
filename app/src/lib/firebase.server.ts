import { createServerOnlyFn } from "@tanstack/react-start";
import admin from "firebase-admin";

let auth: admin.auth.Auth | null = null;
let db: admin.firestore.Firestore | null = null;

const initApp = () => {
  if (!admin.apps?.length) {
    admin.initializeApp();
  }
};

export const getServerAuth = createServerOnlyFn(() => {
  initApp();
  if (auth) return auth;
  auth = admin.auth();
  return auth;
});

export const getServerDB = createServerOnlyFn(() => {
  initApp();
  if (db) return db;

  db = admin.firestore();
  return db;
});
