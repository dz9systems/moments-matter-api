import type { Request, Response } from 'express';
import { getUploadsByUserId } from '../lib/firestore.js';
import { getSignedViewUrl } from '../lib/storage.js';

/** TEMP: align with analyze/generate when auth is re-enabled */
const DEV_USER_ID = '1234567890';

export async function getHistory(_req: Request, res: Response): Promise<void> {
  const userId = DEV_USER_ID;

  let uploads;
  try {
    uploads = await getUploadsByUserId(userId);
  } catch (e) {
    console.error('History fetch error:', e);
    res.status(500).json({ error: 'Failed to fetch history' });
    return;
  }

  const withUrls = await Promise.all(
    uploads.map(async (u) => {
      if (!u.storagePath) return { ...u };
      const signed = await getSignedViewUrl(u.storagePath);
      return signed
        ? { ...u, fileViewUrl: signed.url, fileViewUrlExpiresAt: signed.expiresAt }
        : { ...u };
    }),
  );

  res.json({ uploads: withUrls });
}
