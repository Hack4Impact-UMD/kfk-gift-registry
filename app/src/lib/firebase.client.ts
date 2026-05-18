import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  getToken,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";
import { createClientOnlyFn } from "@tanstack/react-start";
import type { Auth } from "firebase/auth";
import type { AppCheck } from "firebase/app-check";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "kfk-gift-registry.firebaseapp.com",
  projectId: "kfk-gift-registry",
  storageBucket: "kfk-gift-registry.firebasestorage.app",
  messagingSenderId: "1061530360755",
  appId: "1:1061530360755:web:8d972140ad02140e1149c6",
  measurementId: "G-5W4T36409S",
};

declare global {
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

if (import.meta.env.DEV) {
  console.log("===USING APPCHECK DEBUG TOKEN===");
  self.FIREBASE_APPCHECK_DEBUG_TOKEN =
    import.meta.env.VITE_APPCHECK_DEBUG_TOKEN ?? true;
}

const app = initializeApp(firebaseConfig);
let auth: Auth | null = null;
let appCheck: AppCheck | null = null;

export const getClientAuth = createClientOnlyFn(async () => {
  if (auth) return auth;
  auth = getAuth(app);
  if (import.meta.env.DEV) {
    console.log("Connecting auth emulator!");
    connectAuthEmulator(auth, "http://localhost:9099");
  }

  await auth.authStateReady();
  return auth;
});

export const getClientAppCheck = createClientOnlyFn(async () => {
  if (appCheck) return appCheck;

  // Initialize App Check with reCAPTCHA Enterprise
  const reCaptchaPublicKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_KEY;
  if (!reCaptchaPublicKey) {
    console.warn(
      "AppCheck reCAPTCHA Enterprise key not configured. Public endpoints may be vulnerable.",
    );
    return null;
  }

  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(reCaptchaPublicKey),
      isTokenAutoRefreshEnabled: true,
    });

    console.log("AppCheck initialized successfully");
    return appCheck;
  } catch (error) {
    console.error("Failed to initialize AppCheck:", error);
    return null;
  }
});

export const getAppCheckToken = createClientOnlyFn(async () => {
  const ac = await getClientAppCheck();
  if (!ac) return null;

  try {
    // Use getToken to retrieve the AppCheck token
    return (await getToken(ac)).token;
  } catch (error) {
    console.error("Failed to get AppCheck token:", error);
    return null;
  }
});
