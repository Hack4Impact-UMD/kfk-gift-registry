import { createServerOnlyFn } from "@tanstack/react-start";
import * as admin from 'firebase-admin'

if (!admin.apps.length || admin.apps.length === 0) {
  admin.initializeApp()
}

let auth: admin.auth.Auth | null = null;
let db: admin.firestore.Firestore | null = null;

export const getServerAuth = createServerOnlyFn(() => {
  if (auth) return auth;
  auth = admin.auth();
  return auth;
})

export const getServerDB = createServerOnlyFn(() => {
  if (db) return db;

  db = admin.firestore();
  return db;
})
