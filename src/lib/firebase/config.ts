import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { logger } from "@/lib/monitoring/config";
import { deleteOldListings } from "@/lib/firebase/firestore/listing/deleteListing";
import { ToadScheduler, AsyncTask, CronJob } from 'toad-scheduler';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const firebase_app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(firebase_app);
export const storage = getStorage(firebase_app);
export const auth = getAuth(firebase_app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  hd: "g.ucla.edu",
});

// Initialize daily listing clean-up job
const scheduler = new ToadScheduler()
const autodelete_task = new AsyncTask(
    'autodelete old listings',
    () => deleteOldListings(),
    (e: Error) => { logger.warn(`${e} when cleaning up old listings`); },
);
const job = new CronJob({ cronExpression: "0 0 * * *" }, autodelete_task);
scheduler.addCronJob(job);
