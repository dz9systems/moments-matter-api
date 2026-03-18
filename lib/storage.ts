/**
 * Firebase Storage helpers for uploading media files.
 */

import { getBucket } from './firebase';

/**
 * Uploads a file buffer to Firebase Storage and returns the full path.
 * Path format: uploads/{userId}/{uniqueId}_{originalName}
 */
export async function uploadFile(params: {
  userId: string;
  file: Buffer;
  mimeType: string;
  originalName: string;
}): Promise<string> {
  const bucket = getBucket();
  const uniqueId = Date.now().toString(36) + Math.random().toString(36).slice(2);
  const safeName = (params.originalName || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `uploads/${params.userId}/${uniqueId}_${safeName}`;
  const fileRef = bucket.file(path);
  await fileRef.save(params.file, {
    metadata: { contentType: params.mimeType },
  });
  return path;
}

/** Default signed URL lifetime (seconds). Max ~7 days for v4. */
function viewUrlExpiresMs(): number {
  const sec = parseInt(process.env.STORAGE_VIEW_URL_EXPIRES_SECONDS || '86400', 10);
  const s = Number.isFinite(sec) && sec > 0 ? Math.min(sec, 604800) : 86400;
  return s * 1000;
}

/**
 * Time-limited HTTPS URL to view/download the object (private bucket safe).
 * Returns null if path is missing.
 */
export async function getSignedViewUrl(storagePath: string): Promise<{
  url: string;
  expiresAt: string;
} | null> {
  const path = storagePath?.trim();
  if (!path) return null;
  const bucket = getBucket();
  const fileRef = bucket.file(path);
  const ms = viewUrlExpiresMs();
  const [url] = await fileRef.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + ms,
  });
  return {
    url,
    expiresAt: new Date(Date.now() + ms).toISOString(),
  };
}
