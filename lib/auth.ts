/**
 * Firebase Auth helpers for verifying tokens from the Authorization header.
 */

import { getAuth } from 'firebase-admin/auth';
import { initFirebase } from './firebase.js';

/**
 * Gets the Firebase ID token from the request Authorization header.
 * Expects "Bearer <token>".
 */
export function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7).trim() || null;
}

/**
 * Verifies the Firebase ID token and returns the decoded token (includes uid).
 * Returns null if the token is missing or invalid.
 */
export async function verifyAuthToken(
  authHeader: string | null
): Promise<{ uid: string } | null> {
  const token = getBearerToken(authHeader);
  if (!token) {
    return null;
  }
  try {
    initFirebase();
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}
