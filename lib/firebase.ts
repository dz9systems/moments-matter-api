/**
 * Firebase Admin app initialization. Call initFirebase() once before using Auth or Firestore.
 */

import {
  getApps,
  initializeApp,
  applicationDefault,
  cert,
  App,
} from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let app: App | undefined;

/** Structural type only — avoids non-portable @google-cloud/storage Bucket in .d.ts / CJS–ESM duplicates. */
export type AppStorageBucket = {
  file(path: string): {
    save(
      data: Buffer,
      options?: { metadata?: { contentType?: string } },
    ): Promise<void>;
    getSignedUrl(options: {
      version: string;
      action: string;
      expires: number;
    }): Promise<[string]>;
  };
};

function getAdminCredential() {
  /** Render / Heroku / etc.: paste full service account JSON (one line) — never commit this. */
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (inline) {
    try {
      return cert(JSON.parse(inline) as Record<string, unknown>);
    } catch {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON',
      );
    }
  }
  /** Local dev: GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json */
  return applicationDefault();
}

/**
 * Initializes Firebase Admin if not already initialized.
 *
 * **Production (Render):** set `FIREBASE_SERVICE_ACCOUNT_JSON` to the full JSON string.
 * **Local:** `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json` or use inline JSON.
 * Also set `FIREBASE_PROJECT_ID` and `FIREBASE_STORAGE_BUCKET` (project id often in JSON).
 */
export function initFirebase(): App {
  if (getApps().length > 0) {
    return getApps()[0] as App;
  }
  app = initializeApp({
    credential: getAdminCredential(),
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
export function getBucket(): AppStorageBucket {
  initFirebase();
  return getStorage().bucket() as AppStorageBucket;
}
