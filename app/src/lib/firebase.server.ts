import { createServerOnlyFn } from "@tanstack/react-start";
import * as admin from 'firebase-admin'

export const getAdmin = createServerOnlyFn(() => {
  if (!admin.apps.length || admin.apps.length === 0) {
    admin.initializeApp()
  }

  return {
    db: admin.firestore(),
    auth: admin.auth(),
  }
})
