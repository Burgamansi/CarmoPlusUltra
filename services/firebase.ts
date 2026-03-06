import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log("[Firebase] Initializing with config:", { projectId: firebaseConfig.projectId });

let app: any = null;
let db: any = null;
let auth: any = null;
let firebaseError: string | null = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log("[Firebase] ✅ Initialized successfully");
} catch (error: any) {
  firebaseError = error?.message || "Unknown Firebase error";
  console.error("[Firebase] ❌ Initialization failed:", firebaseError);
}

export { app, db, auth, firebaseError };
