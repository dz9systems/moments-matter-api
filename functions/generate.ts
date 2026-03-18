import type { Request, Response } from 'express';
import {
  getMomentById,
  saveCreativePacket,
} from '../lib/firestore.js';
import { generateCreativePacketFields } from '../lib/creativePacket.js';
import type { CreativePacketResponse, GenerateRequestBody } from '../types/index.js';

const DEV_USER_ID = '1234567890';

export async function postGenerate(req: Request, res: Response): Promise<void> {
  const userId = DEV_USER_ID;

  const body = req.body as GenerateRequestBody | undefined;
  if (!body?.momentId || !body?.goal?.trim()) {
    res.status(400).json({ error: 'Request body must include momentId and goal' });
    return;
  }

  const moment = await getMomentById(body.momentId);
  if (!moment) {
    res.status(404).json({ error: 'Moment not found' });
    return;
  }
  if (moment.userId !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  let fields: Awaited<ReturnType<typeof generateCreativePacketFields>>;
  try {
    fields = await generateCreativePacketFields(moment, body.goal.trim());
  } catch (e) {
    console.error('Generate creative packet error:', e);
    res.status(500).json({ error: 'Failed to generate creative packet' });
    return;
  }

  const content = JSON.stringify(fields);
  let packetId: string;
  try {
    packetId = await saveCreativePacket({
      momentId: body.momentId,
      uploadId: moment.uploadId,
      userId,
      goal: body.goal.trim(),
      content,
    });
  } catch (e) {
    console.error('Save creative packet error:', e);
    res.status(500).json({ error: 'Failed to save creative packet' });
    return;
  }
  const packet: CreativePacketResponse = {
    id: packetId,
    momentId: body.momentId,
    uploadId: moment.uploadId,
    userId,
    goal: body.goal.trim(),
    content,
    createdAt: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 },
    ...fields,
  };
  res.json({ packet });
}
