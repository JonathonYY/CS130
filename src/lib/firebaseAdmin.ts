import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import path from "path"; // Add this import

if (!getApps().length) {
  try {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!serviceAccountPath) {
      throw new Error(
        "GOOGLE_APPLICATION_CREDENTIALS environment variable is not set."
      );
    }

    const absolutePath = path.resolve(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log("Firebase Admin initialized");
  } catch (error: any) {
    console.error("Firebase Admin initialization error", error.stack);
  }
}

export default admin;
