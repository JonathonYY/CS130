// lib/firebaseAdmin.js
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Firebase Admin initialization error", error.stack);
    }
  }
}

export default admin;
