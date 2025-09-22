// lib/firebase-admin.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Ensure we don’t re-initialize
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: "dzapp-35b48",
      clientEmail: "firebase-adminsdk-fbsvc@dzapp-35b48.iam.gserviceaccount.com",
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const adminAuth = getAuth();
const adminFirestore = getFirestore();

export { adminAuth, adminFirestore };
