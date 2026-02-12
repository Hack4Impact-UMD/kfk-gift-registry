import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
  measurementId: "G-5W4T36409S"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);