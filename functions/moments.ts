import type { Request, Response } from 'express';
import {
  getMomentsByUserId,
  getMomentsByUploadId,
} from '../lib/firestore.js';

/** Same anonymous user as analyze/history until auth exists */
const SHARED_USER_ID = '1234567890';

/**
 * GET /api/moments
 * - No query: all moments for the shared user (newest first).
 * - ?uploadId=... : only moments from that upload (e.g. after analyze).
 */
export async function getMoments(req: Request, res: Response): Promise<void> {
  const uploadId =
    typeof req.query.uploadId === 'string' ? req.query.uploadId.trim() : '';

  try {
    if (uploadId) {
      const moments = await getMomentsByUploadId(uploadId);
      const owned = moments.filter((m) => m.userId === SHARED_USER_ID);
      res.json({ moments: owned });
      return;
    }
    const moments = await getMomentsByUserId(SHARED_USER_ID);
    res.json({ moments });
  } catch (e) {
    console.error('GET /api/moments error:', e);
    res.status(500).json({ error: 'Failed to fetch moments' });
  }
}
