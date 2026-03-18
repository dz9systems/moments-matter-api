import type { Request, Response } from 'express';
import {
  getUploadById,
  getMomentsByUploadId,
  getCreativePacketsByUploadId,
} from '../lib/firestore.js';
import { getSignedViewUrl } from '../lib/storage.js';
import { parseCreativePacketContent } from '../lib/creativePacket.js';
import type { CreativePacketWithParsed, UploadWithSignedUrls } from '../types/index.js';

const DEV_USER_ID = '1234567890';

export async function getUploadDetail(req: Request, res: Response): Promise<void> {
  const userId = DEV_USER_ID;
  const uploadId = req.params.id;
  if (!uploadId) {
    res.status(400).json({ error: 'Upload id required' });
    return;
  }

  const uploadRow = await getUploadById(uploadId);
  if (!uploadRow) {
    res.status(404).json({ error: 'Upload not found' });
    return;
  }
  if (uploadRow.userId !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  let moments, creativePackets;
  try {
    [moments, creativePackets] = await Promise.all([
      getMomentsByUploadId(uploadId),
      getCreativePacketsByUploadId(uploadId),
    ]);
  } catch (e) {
    console.error('Fetch upload detail error:', e);
    res.status(500).json({ error: 'Failed to fetch upload detail' });
    return;
  }
  let uploadOut: UploadWithSignedUrls = { ...uploadRow };
  if (uploadRow.storagePath) {
    const signed = await getSignedViewUrl(uploadRow.storagePath);
    if (signed) {
      uploadOut = {
        ...uploadOut,
        fileViewUrl: signed.url,
        fileViewUrlExpiresAt: signed.expiresAt,
      };
    }
  }

  const packetsOut: CreativePacketWithParsed[] = creativePackets.map((p) => {
    const parsed = parseCreativePacketContent(p.content);
    return parsed ? { ...p, ...parsed } : p;
  });

  res.json({ upload: uploadOut, moments, creativePackets: packetsOut });
}
