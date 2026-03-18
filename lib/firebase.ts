/**
 * Firebase Admin app initialization. Call initFirebase() once before using Auth or Firestore.
 */

import { getApps, initializeApp, applicationDefault, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let app: App | undefined;

/**
 * Initializes Firebase Admin if not already initialized.
 * Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.
 * Set FIREBASE_PROJECT_ID and FIREBASE_STORAGE_BUCKET in env.
 */
export function initFirebase(): App {
  if (getApps().length > 0) {
    return getApps()[0] as App;
  }
  app = initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  return app;
}

/**
 * Returns Firestore instance. Call initFirebase() first.
 */
export function getDb() {
  initFirebase();
  return getFirestore();
}

/**
 * Returns Firebase Storage bucket. Call initFirebase() first.
 */
export function getBucket() {
  initFirebase();
  return getStorage().bucket();
}
