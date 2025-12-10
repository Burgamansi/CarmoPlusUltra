
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const fallbackConfig = {
  apiKey: "FAKE_KEY_FOR_BUILD_PREVIEW",
  authDomain: "FAKE_DOMAIN",
  projectId: "FAKE_PROJECT",
  storageBucket: "FAKE_BUCKET",
  messagingSenderId: "FAKE_SENDER",
  appId: "FAKE_APP"
};

// Safe access to environment variables
const env = (import.meta as any).env || {};

const firebaseConfig =
  typeof env.VITE_FIREBASE_API_KEY !== "undefined"
    ? {
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID
      }
    : fallbackConfig;

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
